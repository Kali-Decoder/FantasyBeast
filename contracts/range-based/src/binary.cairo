

#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
enum MarketStatus {
    Active,
    Ended,
    Settled,
}

#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
enum Outcome {
    Yes,
    No,
}

// Struct to represent a binary prediction bet
#[derive(Copy, Drop, Serde, starknet::Store)]
struct BinaryBet {
    bettor: starknet::ContractAddress,
    prediction: Outcome,
    bet_amount: u256,
    claimed: bool,
}

// Struct to represent a binary prediction market
#[derive(Copy, Drop, Serde, starknet::Store)]
struct BinaryMarket {
    creator: starknet::ContractAddress,
    question: felt252,
    description: felt252,
    start_time: u64,
    end_time: u64,
    resolution_time: u64,
    max_bettors: u32,
    total_bets: u32,
    yes_amount: u256,
    no_amount: u256,
    total_amount: u256,
    final_outcome: Outcome,
    status: MarketStatus,
}

// Struct to return market state
#[derive(Copy, Drop, Serde, starknet::Store)]
struct MarketInfo {
    creator: starknet::ContractAddress,
    question: felt252,
    description: felt252,
    start_time: u64,
    end_time: u64,
    resolution_time: u64,
    max_bettors: u32,
    total_bets: u32,
    yes_amount: u256,
    no_amount: u256,
    total_amount: u256,
    final_outcome: Outcome,
    status: MarketStatus,
}

// Struct to return bet info
#[derive(Copy, Drop, Serde, starknet::Store)]
struct BetInfo {
    bettor: starknet::ContractAddress,
    prediction: Outcome,
    bet_amount: u256,
    claimed: bool,
}

// Struct to return market with ID
#[derive(Copy, Drop, Serde, starknet::Store)]
struct MarketWithId {
    market_id: u32,
    market_info: MarketInfo,
}

#[starknet::interface]
pub trait IBinaryPredictionMarket<TContractState> {
    fn create_market(
        ref self: TContractState,
        question: felt252,
        description: felt252,
        start_time: u64,
        end_time: u64,
        resolution_time: u64,
        max_bettors: u32,
        initial_stake: u256,
        initial_prediction: Outcome,
    ) -> u32;

    fn place_bet(ref self: TContractState, market_id: u32, prediction: Outcome, bet_amount: u256);

    fn resolve_market(ref self: TContractState, market_id: u32, final_outcome: Outcome);
    fn claim_reward(ref self: TContractState, market_id: u32);
    fn get_market(self: @TContractState, market_id: u32) -> MarketInfo;
    fn get_bet(self: @TContractState, market_id: u32, bet_id: u32) -> BetInfo;
    fn get_market_odds(self: @TContractState, market_id: u32) -> (u256, u256);
    fn get_user_bets(self: @TContractState, market_id: u32, user: starknet::ContractAddress) -> Array<u32>;
    fn get_all_markets(self: @TContractState) -> Array<MarketWithId>;
    fn get_markets_count(self: @TContractState) -> u32;
    fn get_owner(self: @TContractState) -> starknet::ContractAddress;
    fn transfer_ownership(ref self: TContractState, new_owner: starknet::ContractAddress);
}

#[starknet::contract]
pub mod BinaryPredictionMarket {
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
    use super::{BinaryMarket, MarketInfo, MarketStatus, BinaryBet, BetInfo, Outcome, MarketWithId};

    #[storage]
    struct Storage {
        // Contract owner (deployer)
        owner: ContractAddress,
        // Contract balance
        balance: u256,
        // Market management
        markets_len: u32,
        markets: Map<u32, BinaryMarket>,
        // Bets management
        market_bets_len: Map<u32, u32>,
        bets: Map<u64, BinaryBet>, // market_id * MAX_BETS + bet_id
        // User bet tracking
        user_bet_counts: Map<(u32, ContractAddress), u32>, // (market_id, user) -> bet_count
        user_bets: Map<(u32, ContractAddress, u32), u32>, // (market_id, user, index) -> bet_id
        // STARK token address
        strk_token: ContractAddress,
        // Protocol fee (in basis points, e.g., 500 = 5%)
        protocol_fee: u16,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        MarketCreated: MarketCreated,
        BetPlaced: BetPlaced,
        MarketResolved: MarketResolved,
        RewardClaimed: RewardClaimed,
        OwnershipTransferred: OwnershipTransferred,
    }

    #[derive(Drop, starknet::Event)]
    struct MarketCreated {
        market_id: u32,
        creator: ContractAddress,
        question: felt252,
        description: felt252,
        start_time: u64,
        end_time: u64,
        resolution_time: u64,
        max_bettors: u32,
        initial_stake: u256,
        initial_prediction: Outcome,
    }

    #[derive(Drop, starknet::Event)]
    struct BetPlaced {
        market_id: u32,
        bet_id: u32,
        bettor: ContractAddress,
        prediction: Outcome,
        bet_amount: u256,
        yes_total: u256,
        no_total: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct MarketResolved {
        market_id: u32,
        final_outcome: Outcome,
        total_amount: u256,
        winning_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardClaimed {
        market_id: u32,
        bet_id: u32,
        bettor: ContractAddress,
        reward_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    // Constants
    const MAX_BETS: u64 = 10000; // Maximum number of bets per market
    const BASIS_POINTS: u16 = 10000; // 100% = 10000 basis points

    #[constructor]
    fn constructor(ref self: ContractState, strk_token_address: ContractAddress, protocol_fee: u16) {
        assert(protocol_fee <= 1000, 'Protocol fee too high'); // Max 10%
        self.strk_token.write(strk_token_address);
        self.protocol_fee.write(protocol_fee);
        self.markets_len.write(0);
        // Set the deployer as the owner
        self.owner.write(get_caller_address());
    }

    #[abi(embed_v0)]
    impl BinaryPredictionMarketImpl of super::IBinaryPredictionMarket<ContractState> {
        fn create_market(
            ref self: ContractState,
            question: felt252,
            description: felt252,
            start_time: u64,
            end_time: u64,
            resolution_time: u64,
            max_bettors: u32,
            initial_stake: u256,
            initial_prediction: Outcome,
        ) -> u32 {
            // Validations
            let current_time = get_block_timestamp();
            assert(start_time >= current_time, 'Start time must be in future');
            assert(end_time > start_time, 'End time must be after start');
            assert(resolution_time >= end_time, 'Resolution after end time');
            assert(max_bettors > 0, 'Must allow at least one bettor');
            assert(initial_stake > 0, 'Initial stake must be > 0');

            let caller = get_caller_address();
            let market_id = self.markets_len.read();

            // Create market
            let new_market = BinaryMarket {
                creator: caller,
                question: question,
                description: description,
                start_time: start_time,
                end_time: end_time,
                resolution_time: resolution_time,
                max_bettors: max_bettors,
                total_bets: 1, // Creator's initial bet
                yes_amount: if initial_prediction == Outcome::Yes { initial_stake } else { 0 },
                no_amount: if initial_prediction == Outcome::No { initial_stake } else { 0 },
                total_amount: initial_stake,
                final_outcome: Outcome::Yes, // Default value, will be set during resolution
                status: MarketStatus::Active,
            };

            self.markets.entry(market_id).write(new_market);
            self.markets_len.write(market_id + 1);
            self.market_bets_len.entry(market_id).write(1);

            // Create initial bet for creator
            let initial_bet = BinaryBet {
                bettor: caller,
                prediction: initial_prediction,
                bet_amount: initial_stake,
                claimed: false,
            };

            let market_id_u64: u64 = market_id.into();
            let key = market_id_u64 * MAX_BETS + 0; // bet_id = 0 for creator
            self.bets.entry(key).write(initial_bet);

            // Track user bet
            self.user_bet_counts.entry((market_id, caller)).write(1);
            self.user_bets.entry((market_id, caller, 0)).write(0);

            // Transfer initial stake
            self._increase_balance(initial_stake);

            // Emit event
            self
                .emit(
                    MarketCreated {
                        market_id: market_id,
                        creator: caller,
                        question: question,
                        description: description,
                        start_time: start_time,
                        end_time: end_time,
                        resolution_time: resolution_time,
                        max_bettors: max_bettors,
                        initial_stake: initial_stake,
                        initial_prediction: initial_prediction,
                    },
                );

            market_id
        }

        fn place_bet(
            ref self: ContractState, market_id: u32, prediction: Outcome, bet_amount: u256,
        ) {
            // Get market and validate
            let mut market = self.markets.entry(market_id).read();
            assert(market.status == MarketStatus::Active, 'Market is not active');

            let current_time = get_block_timestamp();
            assert(current_time >= market.start_time, 'Betting not started yet');
            assert(current_time < market.end_time, 'Betting period ended');

            let total_bets = market.total_bets;
            assert(total_bets < market.max_bettors, 'Maximum bettors reached');
            assert(bet_amount > 0, 'Bet amount must be > 0');

            let caller = get_caller_address();

            // Create bet
            let bet_id = total_bets;
            let bet = BinaryBet {
                bettor: caller,
                prediction: prediction,
                bet_amount: bet_amount,
                claimed: false,
            };

            // Calculate storage key for bet
            let market_id_u64: u64 = market_id.into();
            let bet_id_u64: u64 = bet_id.into();
            let key = market_id_u64 * MAX_BETS + bet_id_u64;

            // Store bet
            self.bets.entry(key).write(bet);

            // Update market amounts
            match prediction {
                Outcome::Yes => { market.yes_amount = market.yes_amount + bet_amount; },
                Outcome::No => { market.no_amount = market.no_amount + bet_amount; },
            }

            market.total_bets = total_bets + 1;
            market.total_amount = market.total_amount + bet_amount;
            self.markets.entry(market_id).write(market);
            self.market_bets_len.entry(market_id).write(total_bets + 1);

            // Track user bet
            let user_bet_count = self.user_bet_counts.entry((market_id, caller)).read();
            self.user_bet_counts.entry((market_id, caller)).write(user_bet_count + 1);
            self.user_bets.entry((market_id, caller, user_bet_count)).write(bet_id);

            // Transfer tokens to contract
            self._increase_balance(bet_amount);

            // Emit event
            self
                .emit(
                    BetPlaced {
                        market_id: market_id,
                        bet_id: bet_id,
                        bettor: caller,
                        prediction: prediction,
                        bet_amount: bet_amount,
                        yes_total: market.yes_amount,
                        no_total: market.no_amount,
                    },
                );
        }

        fn resolve_market(ref self: ContractState, market_id: u32, final_outcome: Outcome) {
            // Get market and validate
            let mut market = self.markets.entry(market_id).read();
            assert(market.status == MarketStatus::Active, 'Market is not active');

            let caller = get_caller_address();
            let owner = self.owner.read();
            assert(caller == owner, 'Only owner can resolve markets');

            let current_time = get_block_timestamp();
            assert(current_time >= market.resolution_time, 'Too early to resolve');

            // Update market with result
            market.final_outcome = final_outcome;
            market.status = MarketStatus::Settled;
            self.markets.entry(market_id).write(market);

            // Calculate winning amount
            let winning_amount = match final_outcome {
                Outcome::Yes => market.yes_amount,
                Outcome::No => market.no_amount,
            };

            // Emit event
            self
                .emit(
                    MarketResolved {
                        market_id: market_id,
                        final_outcome: final_outcome,
                        total_amount: market.total_amount,
                        winning_amount: winning_amount,
                    },
                );
        }

        fn claim_reward(ref self: ContractState, market_id: u32) {
            // Get market and validate
            let market = self.markets.entry(market_id).read();
            assert(market.status == MarketStatus::Settled, 'Market not settled yet');

            let caller = get_caller_address();

            // Get user's bets
            let user_bet_count = self.user_bet_counts.entry((market_id, caller)).read();
            assert(user_bet_count > 0, 'No bets found for user');

            let mut total_reward: u256 = 0;
            let mut i: u32 = 0;

            while i < user_bet_count {
                let bet_id = self.user_bets.entry((market_id, caller, i)).read();
                let market_id_u64: u64 = market_id.into();
                let bet_id_u64: u64 = bet_id.into();
                let key = market_id_u64 * MAX_BETS + bet_id_u64;
                
                let bet = self.bets.entry(key).read();
                
                if !bet.claimed && bet.prediction == market.final_outcome {
                    // Calculate reward for this bet
                    let reward = self._calculate_reward(bet.bet_amount, @market);
                    total_reward += reward;

                    // Mark bet as claimed
                    let mut updated_bet = bet;
                    updated_bet.claimed = true;
                    self.bets.entry(key).write(updated_bet);

                    // Emit event for each bet claimed
                    self
                        .emit(
                            RewardClaimed {
                                market_id: market_id,
                                bet_id: bet_id,
                                bettor: caller,
                                reward_amount: reward,
                            },
                        );
                }

                i += 1;
            }

            // Transfer total reward
            if total_reward > 0 {
                self._decrease_balance(total_reward);
                self._transfer_tokens(caller, total_reward);
            }
        }

        fn get_market(self: @ContractState, market_id: u32) -> MarketInfo {
            let market = self.markets.entry(market_id).read();

            MarketInfo {
                creator: market.creator,
                question: market.question,
                description: market.description,
                start_time: market.start_time,
                end_time: market.end_time,
                resolution_time: market.resolution_time,
                max_bettors: market.max_bettors,
                total_bets: market.total_bets,
                yes_amount: market.yes_amount,
                no_amount: market.no_amount,
                total_amount: market.total_amount,
                final_outcome: market.final_outcome,
                status: market.status,
            }
        }

        fn get_bet(self: @ContractState, market_id: u32, bet_id: u32) -> BetInfo {
            let market_id_u64: u64 = market_id.into();
            let bet_id_u64: u64 = bet_id.into();
            let key = market_id_u64 * MAX_BETS + bet_id_u64;

            let bet = self.bets.entry(key).read();

            BetInfo {
                bettor: bet.bettor,
                prediction: bet.prediction,
                bet_amount: bet.bet_amount,
                claimed: bet.claimed,
            }
        }

        fn get_market_odds(self: @ContractState, market_id: u32) -> (u256, u256) {
            let market = self.markets.entry(market_id).read();
            
            if market.total_amount == 0 {
                return (1, 1); // Equal odds if no bets
            }

            // Calculate implied odds (how much you win per unit bet)
            // If you bet on YES and it wins, you get total_pool / yes_amount per unit
            let yes_odds = if market.yes_amount > 0 {
                (market.total_amount * 1000) / market.yes_amount // Multiply by 1000 for precision
            } else {
                0
            };

            let no_odds = if market.no_amount > 0 {
                (market.total_amount * 1000) / market.no_amount
            } else {
                0
            };

            (yes_odds, no_odds)
        }

        fn get_user_bets(self: @ContractState, market_id: u32, user: ContractAddress) -> Array<u32> {
            let mut bet_ids: Array<u32> = array![];
            let user_bet_count = self.user_bet_counts.entry((market_id, user)).read();
            
            let mut i: u32 = 0;
            while i < user_bet_count {
                let bet_id = self.user_bets.entry((market_id, user, i)).read();
                bet_ids.append(bet_id);
                i += 1;
            }

            bet_ids
        }

        fn get_all_markets(self: @ContractState) -> Array<MarketWithId> {
            let mut markets: Array<MarketWithId> = array![];
            let total_markets = self.markets_len.read();
            
            let mut i: u32 = 0;
            while i < total_markets {
                let market = self.markets.entry(i).read();
                let market_info = MarketInfo {
                    creator: market.creator,
                    question: market.question,
                    description: market.description,
                    start_time: market.start_time,
                    end_time: market.end_time,
                    resolution_time: market.resolution_time,
                    max_bettors: market.max_bettors,
                    total_bets: market.total_bets,
                    yes_amount: market.yes_amount,
                    no_amount: market.no_amount,
                    total_amount: market.total_amount,
                    final_outcome: market.final_outcome,
                    status: market.status,
                };
                
                let market_with_id = MarketWithId {
                    market_id: i,
                    market_info: market_info,
                };
                
                markets.append(market_with_id);
                i += 1;
            }

            markets
        }

        fn get_markets_count(self: @ContractState) -> u32 {
            self.markets_len.read()
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            let caller = get_caller_address();
            let current_owner = self.owner.read();
            assert(caller == current_owner, 'Not the owner');
            
            let previous_owner = current_owner;
            self.owner.write(new_owner);
            
            self.emit(
                OwnershipTransferred {
                    previous_owner: previous_owner,
                    new_owner: new_owner,
                }
            );
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _calculate_reward(
            self: @ContractState,
            bet_amount: u256,
            market: @BinaryMarket,
        ) -> u256 {
            let winning_pool = match *market.final_outcome {
                Outcome::Yes => *market.yes_amount,
                Outcome::No => *market.no_amount,
            };

            if winning_pool == 0 {
                return 0;
            }

            // Calculate protocol fee
            let protocol_fee = self.protocol_fee.read();
            let fee_amount = (*market.total_amount * protocol_fee.into()) / BASIS_POINTS.into();
            let distributable_amount = *market.total_amount - fee_amount;

            // Proportional reward based on bet size relative to winning pool
            let reward = (distributable_amount * bet_amount) / winning_pool;

            reward
        }

        fn _increase_balance(ref self: ContractState, amount: u256) {
            assert(amount != 0, 'Amount cannot be 0');

            let strk_addr: ContractAddress = self.strk_token.read();
            let strk_dispatcher = IERC20Dispatcher { contract_address: strk_addr };

            let caller = get_caller_address();
            let contract_address = get_contract_address();

            let allowance = strk_dispatcher.allowance(caller, contract_address);
            assert(allowance >= amount, 'Not enough allowance');

            strk_dispatcher.transfer_from(caller, contract_address, amount);

            // Update the contract's balance
            self.balance.write(self.balance.read() + amount);
        }

        fn _decrease_balance(ref self: ContractState, amount: u256) {
            assert(amount != 0, 'Amount cannot be 0');
            self.balance.write(self.balance.read() - amount);
        }

        fn _transfer_tokens(ref self: ContractState, to: ContractAddress, amount: u256) {
            assert(amount != 0, 'Amount cannot be 0');

            let strk_addr: ContractAddress = self.strk_token.read();
            let strk_dispatcher = IERC20Dispatcher { contract_address: strk_addr };

            strk_dispatcher.transfer(to, amount);
        }
    }
}
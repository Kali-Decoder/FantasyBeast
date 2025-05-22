#[derive(Copy, Drop, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
enum PoolStatus {
    Active,
    Ended,
    Settled,
}

// Struct to represent a prediction bet
#[derive(Copy, Drop, Serde, starknet::Store)]
struct Prediction {
    bettor: starknet::ContractAddress,
    predicted_value: u256,
    bet_amount: u256,
    claimed: bool,
}

// Struct to represent a prediction pool
#[derive(Copy, Drop, Serde, starknet::Store)]
struct Pool {
    creator: starknet::ContractAddress,
    question: felt252,
    start_time: u64,
    end_time: u64,
    max_bettors: u32,
    total_bets: u32,
    total_amount: u256,
    actual_result: u256,
    status: PoolStatus,
}

// Struct to return pool state
#[derive(Copy, Drop, Serde, starknet::Store)]
struct PoolState {
    creator: starknet::ContractAddress,
    question: felt252,
    start_time: u64,
    end_time: u64,
    max_bettors: u32,
    total_bets: u32,
    total_amount: u256,
    actual_result: u256,
    status: PoolStatus,
}

// Struct to return prediction info
#[derive(Copy, Drop, Serde, starknet::Store)]
struct PredictionInfo {
    bettor: starknet::ContractAddress,
    predicted_value: u256,
    bet_amount: u256,
    claimed: bool,
}

#[starknet::interface]
pub trait IPredictionMarket<TContractState> {
    fn create_pool(
        ref self: TContractState,
        question: felt252,
        start_time: u64,
        end_time: u64,
        max_bettors: u32,
        initial_stake: u256,
    ) -> u32;

    fn place_bet(ref self: TContractState, pool_id: u32, predicted_value: u256, bet_amount: u256);

    fn set_result(ref self: TContractState, pool_id: u32, result: u256);
    fn claim_reward(ref self: TContractState, pool_id: u32);
    fn get_pool(self: @TContractState, pool_id: u32) -> PoolState;
    fn get_prediction(self: @TContractState, pool_id: u32, prediction_id: u32) -> PredictionInfo;
}

#[starknet::contract]
mod Buzzify {
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
    use super::{Pool, PoolState, PoolStatus, Prediction, PredictionInfo};

    #[storage]
    struct Storage {
        // Contract balance
        balance: u256,
        // Pool management
        pools_len: u32,
        pools: Map<u32, Pool>,
        // Predictions management
        pool_predictions_len: Map<u32, u32>,
        predictions: Map<u64, Prediction>, // pool_id * MAX_PREDICTIONS + prediction_id
        // STARK token address
        strk_token: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PoolCreated: PoolCreated,
        BetPlaced: BetPlaced,
        ResultSet: ResultSet,
        RewardClaimed: RewardClaimed,
    }

    #[derive(Drop, starknet::Event)]
    struct PoolCreated {
        pool_id: u32,
        creator: ContractAddress,
        question: felt252,
        start_time: u64,
        end_time: u64,
        max_bettors: u32,
        initial_stake: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct BetPlaced {
        pool_id: u32,
        prediction_id: u32,
        bettor: ContractAddress,
        predicted_value: u256,
        bet_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ResultSet {
        pool_id: u32,
        result: u256,
        total_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardClaimed {
        pool_id: u32,
        prediction_id: u32,
        bettor: ContractAddress,
        reward_amount: u256,
    }

    // Constants
    const MAX_PREDICTIONS: u64 = 1000; // Maximum number of predictions per pool

    #[constructor]
    fn constructor(ref self: ContractState, strk_token_address: ContractAddress) {
        self.strk_token.write(strk_token_address);
        self.pools_len.write(0);
    }

    #[abi(embed_v0)]
    impl PredictionMarketImpl of super::IPredictionMarket<ContractState> {
        fn create_pool(
            ref self: ContractState,
            question: felt252,
            start_time: u64,
            end_time: u64,
            max_bettors: u32,
            initial_stake: u256,
        ) -> u32 {
            // Validations
            let current_time = get_block_timestamp();
            assert(start_time >= current_time, 'Start time must be in future');
            assert(end_time > start_time, 'End time must be after start');
            assert(max_bettors > 0, 'Must allow at least one bettor');
            assert(initial_stake > 0, 'Initial stake must be > 0');

            let caller = get_caller_address();
            let pool_id = self.pools_len.read();

            // Create pool
            let new_pool = Pool {
                creator: caller,
                question: question,
                start_time: start_time,
                end_time: end_time,
                max_bettors: max_bettors,
                total_bets: 0,
                total_amount: initial_stake,
                actual_result: 0,
                status: PoolStatus::Active,
            };

            self.pools.entry(pool_id).write(new_pool);
            self.pools_len.write(pool_id + 1);
            self.pool_predictions_len.entry(pool_id).write(0);

            // Transfer initial stake
            self._increase_balance(initial_stake);

            // Emit event
            self
                .emit(
                    PoolCreated {
                        pool_id: pool_id,
                        creator: caller,
                        question: question,
                        start_time: start_time,
                        end_time: end_time,
                        max_bettors: max_bettors,
                        initial_stake: initial_stake,
                    },
                );

            pool_id
        }

        fn place_bet(
            ref self: ContractState, pool_id: u32, predicted_value: u256, bet_amount: u256,
        ) {
            // Get pool and validate
            let mut pool = self.pools.entry(pool_id).read();
            assert(pool.status == PoolStatus::Active, 'Pool is not active');

            let current_time = get_block_timestamp();
            assert(current_time >= pool.start_time, 'Betting not started yet');
            assert(current_time < pool.end_time, 'Betting period ended');

            let total_bets = pool.total_bets;
            assert(total_bets < pool.max_bettors, 'Maximum bettors reached');
            assert(bet_amount > 0, 'Bet amount must be > 0');

            let caller = get_caller_address();

            // Create prediction
            let prediction_id = total_bets;
            let prediction = Prediction {
                bettor: caller,
                predicted_value: predicted_value,
                bet_amount: bet_amount,
                claimed: false,
            };

            // Calculate storage key for prediction
            let pool_id_u64: u64 = pool_id.into();
            let prediction_id_u64: u64 = prediction_id.into();
            let key = pool_id_u64 * MAX_PREDICTIONS + prediction_id_u64;

            // Store prediction
            self.predictions.entry(key).write(prediction);

            // Update pool
            pool.total_bets = total_bets + 1;
            pool.total_amount = pool.total_amount + bet_amount;
            self.pools.entry(pool_id).write(pool);
            self.pool_predictions_len.entry(pool_id).write(total_bets + 1);

            // Transfer tokens to contract
            self._increase_balance(bet_amount);

            // Emit event
            self
                .emit(
                    BetPlaced {
                        pool_id: pool_id,
                        prediction_id: prediction_id,
                        bettor: caller,
                        predicted_value: predicted_value,
                        bet_amount: bet_amount,
                    },
                );
        }

        fn set_result(ref self: ContractState, pool_id: u32, result: u256) {
            // Get pool and validate
            let mut pool = self.pools.entry(pool_id).read();
            assert(pool.status == PoolStatus::Active, 'Pool is not active');

            let caller = get_caller_address();
            assert(caller == pool.creator, 'Only creator can set result');

            let current_time = get_block_timestamp();
            assert(current_time >= pool.end_time, 'Pool has not ended yet');

            // Update pool with result
            pool.actual_result = result;
            pool.status = PoolStatus::Settled;
            self.pools.entry(pool_id).write(pool);

            // Emit event
            self
                .emit(
                    ResultSet { pool_id: pool_id, result: result, total_amount: pool.total_amount },
                );
        }

        fn claim_reward(ref self: ContractState, pool_id: u32) {
            // Get pool and validate
            let pool = self.pools.entry(pool_id).read();
            assert(pool.status == PoolStatus::Settled, 'Pool not settled yet');

            let caller = get_caller_address();

            // Find user's prediction
            let total_predictions = self.pool_predictions_len.entry(pool_id).read();
            let mut prediction_id: u32 = 0;
            let mut found = false;
            let pool_id_u64: u64 = pool_id.into();

            while prediction_id < total_predictions {
                let prediction_id_u64: u64 = prediction_id.into();
                let key = pool_id_u64 * MAX_PREDICTIONS + prediction_id_u64;
                let prediction = self.predictions.entry(key).read();

                if prediction.bettor == caller {
                    found = true;

                    // Check if already claimed
                    assert(!prediction.claimed, 'Reward already claimed');

                    // Calculate reward based on accuracy
                    let reward = self
                        ._calculate_reward(
                            pool_id,
                            prediction_id,
                            prediction.predicted_value,
                            pool.actual_result,
                            prediction.bet_amount,
                            pool.total_amount,
                        );

                    // Mark as claimed
                    let mut updated_prediction = prediction;
                    updated_prediction.claimed = true;
                    self.predictions.entry(key).write(updated_prediction);

                    // Transfer reward
                    if reward > 0 {
                        self._decrease_balance(reward);
                        self._transfer_tokens(caller, reward);
                    }

                    // Emit event
                    self
                        .emit(
                            RewardClaimed {
                                pool_id: pool_id,
                                prediction_id: prediction_id,
                                bettor: caller,
                                reward_amount: reward,
                            },
                        );

                    break;
                }

                prediction_id += 1;
            }

            assert(found, 'No prediction found for caller');
        }

        fn get_pool(self: @ContractState, pool_id: u32) -> PoolState {
            let pool = self.pools.entry(pool_id).read();

            PoolState {
                creator: pool.creator,
                question: pool.question,
                start_time: pool.start_time,
                end_time: pool.end_time,
                max_bettors: pool.max_bettors,
                total_bets: pool.total_bets,
                total_amount: pool.total_amount,
                actual_result: pool.actual_result,
                status: pool.status,
            }
        }

        fn get_prediction(
            self: @ContractState, pool_id: u32, prediction_id: u32,
        ) -> PredictionInfo {
            let pool_id_u64: u64 = pool_id.into();
            let prediction_id_u64: u64 = prediction_id.into();
            let key = pool_id_u64 * MAX_PREDICTIONS + prediction_id_u64;

            let prediction = self.predictions.entry(key).read();

            PredictionInfo {
                bettor: prediction.bettor,
                predicted_value: prediction.predicted_value,
                bet_amount: prediction.bet_amount,
                claimed: prediction.claimed,
            }
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        // Fixing the issue with the scores.at() method
        fn _calculate_reward(
            self: @ContractState,
            pool_id: u32,
            prediction_id: u32,
            predicted_value: u256,
            actual_result: u256,
            bet_amount: u256,
            total_pool_amount: u256,
        ) -> u256 {
            // Calculate absolute difference between prediction and actual result
            let difference = if predicted_value >= actual_result {
                predicted_value - actual_result
            } else {
                actual_result - predicted_value
            };

            // Handle edge case of perfect prediction
            if difference == 0 {
                // Perfect prediction gets a bonus
                return bet_amount * 3;
            }

            // Calculate scores for all predictions
            let total_predictions = self.pool_predictions_len.entry(pool_id).read();
            let mut total_score: u256 = 0;
            let mut scores: Array<u256> = array![];
            let mut i: u32 = 0;
            let pool_id_u64: u64 = pool_id.into();

            // First pass: calculate inverse difference for each prediction
            // The smaller the difference, the higher the score
            while i < total_predictions {
                let i_u64: u64 = i.into();
                let key = pool_id_u64 * MAX_PREDICTIONS + i_u64;
                let prediction = self.predictions.entry(key).read();

                // Skip already claimed predictions
                if prediction.claimed {
                    scores.append(0);
                } else {
                    let pred_diff = if prediction.predicted_value >= actual_result {
                        prediction.predicted_value - actual_result
                    } else {
                        actual_result - prediction.predicted_value
                    };

                    // Add 1 to avoid division by zero for perfect predictions
                    let score = if pred_diff == 0 {
                        // Perfect prediction gets higher weight
                        prediction.bet_amount * 10000
                    } else {
                        // Score is inversely proportional to difference and directly proportional
                        // to bet amount
                        (prediction.bet_amount * 1000) / pred_diff
                    };

                    scores.append(score);
                    total_score += score;
                }

                i += 1;
            }


            if total_score == 0 {
                return 0;
            }

            let score_snapshot = scores.at(prediction_id.into());
            let current_score = *score_snapshot;

            // Calculate reward as proportion of pool based on score
            // 90% of the pool is distributed to bettors, 10% goes to the protocol
            let distributable_amount = (total_pool_amount * 90) / 100;
            let reward = (distributable_amount * current_score) / total_score;

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

export const abi = [
  {
    "type": "impl",
    "name": "PredictionMarketImpl",
    "interface_name": "buzzify::IPredictionMarket"
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "enum",
    "name": "buzzify::PoolStatus",
    "variants": [
      {
        "name": "Active",
        "type": "()"
      },
      {
        "name": "Ended",
        "type": "()"
      },
      {
        "name": "Settled",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "buzzify::PoolState",
    "members": [
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "question",
        "type": "core::felt252"
      },
      {
        "name": "start_time",
        "type": "core::integer::u64"
      },
      {
        "name": "end_time",
        "type": "core::integer::u64"
      },
      {
        "name": "max_bettors",
        "type": "core::integer::u32"
      },
      {
        "name": "total_bets",
        "type": "core::integer::u32"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "actual_result",
        "type": "core::integer::u256"
      },
      {
        "name": "status",
        "type": "buzzify::PoolStatus"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "buzzify::PredictionInfo",
    "members": [
      {
        "name": "bettor",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "predicted_value",
        "type": "core::integer::u256"
      },
      {
        "name": "bet_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "claimed",
        "type": "core::bool"
      }
    ]
  },
  {
    "type": "struct",
    "name": "buzzify::PoolInfo",
    "members": [
      {
        "name": "pool_id",
        "type": "core::integer::u32"
      },
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "question",
        "type": "core::felt252"
      },
      {
        "name": "start_time",
        "type": "core::integer::u64"
      },
      {
        "name": "end_time",
        "type": "core::integer::u64"
      },
      {
        "name": "max_bettors",
        "type": "core::integer::u32"
      },
      {
        "name": "total_bets",
        "type": "core::integer::u32"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "actual_result",
        "type": "core::integer::u256"
      },
      {
        "name": "status",
        "type": "buzzify::PoolStatus"
      }
    ]
  },
  {
    "type": "interface",
    "name": "buzzify::IPredictionMarket",
    "items": [
      {
        "type": "function",
        "name": "create_pool",
        "inputs": [
          {
            "name": "question",
            "type": "core::felt252"
          },
          {
            "name": "start_time",
            "type": "core::integer::u64"
          },
          {
            "name": "end_time",
            "type": "core::integer::u64"
          },
          {
            "name": "max_bettors",
            "type": "core::integer::u32"
          },
          {
            "name": "initial_stake",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "place_bet",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::integer::u32"
          },
          {
            "name": "predicted_value",
            "type": "core::integer::u256"
          },
          {
            "name": "bet_amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_result",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::integer::u32"
          },
          {
            "name": "result",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "claim_reward",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_pool",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "buzzify::PoolState"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_prediction",
        "inputs": [
          {
            "name": "pool_id",
            "type": "core::integer::u32"
          },
          {
            "name": "prediction_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "buzzify::PredictionInfo"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_all_pools",
        "inputs": [],
        "outputs": [
          {
            "type": "core::array::Array::<buzzify::PoolInfo>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_pools_count",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "strk_token_address",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::Buzzify::PoolCreated",
    "kind": "struct",
    "members": [
      {
        "name": "pool_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "question",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "start_time",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "end_time",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "max_bettors",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "initial_stake",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::Buzzify::BetPlaced",
    "kind": "struct",
    "members": [
      {
        "name": "pool_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "prediction_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "bettor",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "predicted_value",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "bet_amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::Buzzify::ResultSet",
    "kind": "struct",
    "members": [
      {
        "name": "pool_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "result",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::Buzzify::RewardClaimed",
    "kind": "struct",
    "members": [
      {
        "name": "pool_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "prediction_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "bettor",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "reward_amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::Buzzify::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "PoolCreated",
        "type": "buzzify::Buzzify::PoolCreated",
        "kind": "nested"
      },
      {
        "name": "BetPlaced",
        "type": "buzzify::Buzzify::BetPlaced",
        "kind": "nested"
      },
      {
        "name": "ResultSet",
        "type": "buzzify::Buzzify::ResultSet",
        "kind": "nested"
      },
      {
        "name": "RewardClaimed",
        "type": "buzzify::Buzzify::RewardClaimed",
        "kind": "nested"
      }
    ]
  }
]


export const binaryAbi = [
  {
    "type": "impl",
    "name": "BinaryPredictionMarketImpl",
    "interface_name": "buzzify::IBinaryPredictionMarket"
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "enum",
    "name": "buzzify::Outcome",
    "variants": [
      {
        "name": "Yes",
        "type": "()"
      },
      {
        "name": "No",
        "type": "()"
      }
    ]
  },
  {
    "type": "enum",
    "name": "buzzify::MarketStatus",
    "variants": [
      {
        "name": "Active",
        "type": "()"
      },
      {
        "name": "Ended",
        "type": "()"
      },
      {
        "name": "Settled",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "buzzify::MarketInfo",
    "members": [
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "question",
        "type": "core::felt252"
      },
      {
        "name": "description",
        "type": "core::felt252"
      },
      {
        "name": "start_time",
        "type": "core::integer::u64"
      },
      {
        "name": "end_time",
        "type": "core::integer::u64"
      },
      {
        "name": "resolution_time",
        "type": "core::integer::u64"
      },
      {
        "name": "max_bettors",
        "type": "core::integer::u32"
      },
      {
        "name": "total_bets",
        "type": "core::integer::u32"
      },
      {
        "name": "yes_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "no_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "final_outcome",
        "type": "buzzify::Outcome"
      },
      {
        "name": "status",
        "type": "buzzify::MarketStatus"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "buzzify::BetInfo",
    "members": [
      {
        "name": "bettor",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "prediction",
        "type": "buzzify::Outcome"
      },
      {
        "name": "bet_amount",
        "type": "core::integer::u256"
      },
      {
        "name": "claimed",
        "type": "core::bool"
      }
    ]
  },
  {
    "type": "interface",
    "name": "buzzify::IBinaryPredictionMarket",
    "items": [
      {
        "type": "function",
        "name": "create_market",
        "inputs": [
          {
            "name": "question",
            "type": "core::felt252"
          },
          {
            "name": "description",
            "type": "core::felt252"
          },
          {
            "name": "start_time",
            "type": "core::integer::u64"
          },
          {
            "name": "end_time",
            "type": "core::integer::u64"
          },
          {
            "name": "resolution_time",
            "type": "core::integer::u64"
          },
          {
            "name": "max_bettors",
            "type": "core::integer::u32"
          },
          {
            "name": "initial_stake",
            "type": "core::integer::u256"
          },
          {
            "name": "initial_prediction",
            "type": "buzzify::Outcome"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "place_bet",
        "inputs": [
          {
            "name": "market_id",
            "type": "core::integer::u32"
          },
          {
            "name": "prediction",
            "type": "buzzify::Outcome"
          },
          {
            "name": "bet_amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "resolve_market",
        "inputs": [
          {
            "name": "market_id",
            "type": "core::integer::u32"
          },
          {
            "name": "final_outcome",
            "type": "buzzify::Outcome"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "claim_reward",
        "inputs": [
          {
            "name": "market_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_market",
        "inputs": [
          {
            "name": "market_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "buzzify::MarketInfo"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_bet",
        "inputs": [
          {
            "name": "market_id",
            "type": "core::integer::u32"
          },
          {
            "name": "bet_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "buzzify::BetInfo"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_market_odds",
        "inputs": [
          {
            "name": "market_id",
            "type": "core::integer::u32"
          }
        ],
        "outputs": [
          {
            "type": "(core::integer::u256, core::integer::u256)"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_user_bets",
        "inputs": [
          {
            "name": "market_id",
            "type": "core::integer::u32"
          },
          {
            "name": "user",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::integer::u32>"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "strk_token_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "protocol_fee",
        "type": "core::integer::u16"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::BinaryPredictionMarket::MarketCreated",
    "kind": "struct",
    "members": [
      {
        "name": "market_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "creator",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "question",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "description",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "start_time",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "end_time",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "resolution_time",
        "type": "core::integer::u64",
        "kind": "data"
      },
      {
        "name": "max_bettors",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "initial_stake",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "initial_prediction",
        "type": "buzzify::Outcome",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::BinaryPredictionMarket::BetPlaced",
    "kind": "struct",
    "members": [
      {
        "name": "market_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "bet_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "bettor",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "prediction",
        "type": "buzzify::Outcome",
        "kind": "data"
      },
      {
        "name": "bet_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "yes_total",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "no_total",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::BinaryPredictionMarket::MarketResolved",
    "kind": "struct",
    "members": [
      {
        "name": "market_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "final_outcome",
        "type": "buzzify::Outcome",
        "kind": "data"
      },
      {
        "name": "total_amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "winning_amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::BinaryPredictionMarket::RewardClaimed",
    "kind": "struct",
    "members": [
      {
        "name": "market_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "bet_id",
        "type": "core::integer::u32",
        "kind": "data"
      },
      {
        "name": "bettor",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "reward_amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "buzzify::BinaryPredictionMarket::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "MarketCreated",
        "type": "buzzify::BinaryPredictionMarket::MarketCreated",
        "kind": "nested"
      },
      {
        "name": "BetPlaced",
        "type": "buzzify::BinaryPredictionMarket::BetPlaced",
        "kind": "nested"
      },
      {
        "name": "MarketResolved",
        "type": "buzzify::BinaryPredictionMarket::MarketResolved",
        "kind": "nested"
      },
      {
        "name": "RewardClaimed",
        "type": "buzzify::BinaryPredictionMarket::RewardClaimed",
        "kind": "nested"
      }
    ]
  }
]



export const range_deployAddress = "0x712fd40927f728066c7df74251b6e73604efb878aa30a9b2ba2df639e5ca4d6"


export const binary_deployAddress = "0xc4897c0c128375224f352519c8d0640465542ee2729f0444359ced82ab4f12"


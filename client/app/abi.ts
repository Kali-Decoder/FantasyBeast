import { Abi } from "starknet";

export const ERC20Abi: Abi = [
  {
    inputs: [],
    name: "finalized",
    outputs: [
      {
        name: "res",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    data: [
      {
        name: "new_governor_nominee",
        type: "felt",
      },
      {
        name: "nominated_by",
        type: "felt",
      },
    ],
    keys: [],
    name: "governor_nominated",
    type: "event",
  },
  {
    data: [
      {
        name: "cancelled_nominee",
        type: "felt",
      },
      {
        name: "cancelled_by",
        type: "felt",
      },
    ],
    keys: [],
    name: "nomination_cancelled",
    type: "event",
  },
  {
    data: [
      {
        name: "removed_governor",
        type: "felt",
      },
      {
        name: "removed_by",
        type: "felt",
      },
    ],
    keys: [],
    name: "governor_removed",
    type: "event",
  },
  {
    data: [
      {
        name: "new_governor",
        type: "felt",
      },
    ],
    keys: [],
    name: "governance_accepted",
    type: "event",
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt",
      },
    ],
    name: "is_governor",
    outputs: [
      {
        name: "is_governor_",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "nominee",
        type: "felt",
      },
    ],
    name: "nominate_new_governor",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "cancelee",
        type: "felt",
      },
    ],
    name: "cancel_nomination",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "removee",
        type: "felt",
      },
    ],
    name: "remove_governor",
    outputs: [],
    type: "function",
  },
  {
    inputs: [],
    name: "accept_governance",
    outputs: [],
    type: "function",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    keys: [],
    name: "implementation_added",
    type: "event",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    keys: [],
    name: "implementation_removed",
    type: "event",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
    ],
    keys: [],
    name: "implementation_upgraded",
    type: "event",
  },
  {
    data: [
      {
        name: "implementation_hash",
        type: "felt",
      },
    ],
    keys: [],
    name: "implementation_finalized",
    type: "event",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_upgrade_delay",
    outputs: [
      {
        name: "delay_seconds",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "implementation_time",
    outputs: [
      {
        name: "time",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "add_implementation",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "remove_implementation",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "implementation_hash_",
        type: "felt",
      },
      {
        name: "eic_hash",
        type: "felt",
      },
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
      {
        name: "final",
        type: "felt",
      },
    ],
    name: "upgrade_to",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "init_vector_len",
        type: "felt",
      },
      {
        name: "init_vector",
        type: "felt*",
      },
    ],
    name: "initialize",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "upgrade_delay_seconds",
        type: "felt",
      },
    ],
    name: "constructor",
    outputs: [],
    type: "constructor",
  },
  {
    inputs: [
      {
        name: "selector",
        type: "felt",
      },
      {
        name: "calldata_size",
        type: "felt",
      },
      {
        name: "calldata",
        type: "felt*",
      },
    ],
    name: "__default__",
    outputs: [
      {
        name: "retdata_size",
        type: "felt",
      },
      {
        name: "retdata",
        type: "felt*",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "selector",
        type: "felt",
      },
      {
        name: "calldata_size",
        type: "felt",
      },
      {
        name: "calldata",
        type: "felt*",
      },
    ],
    name: "__l1_default__",
    outputs: [],
    type: "l1_handler",
  },
];

export const Range_Market_Abi:Abi = [
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

export const abi=[
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


export const deployAddress="0x6514990e270b98d65f6357546567729b9c2906fc4bf0699d9bd9f52705d3c6d"


// {
//   deployResponse: {
//     declare: {
//       transaction_hash: '0x762e261d4157042e343d87d91c5a78487d46c57be459eef814665c106b1758',
//       class_hash: '0x3003e91bac73b3e58dd00436c0182cf1a73e899fbbb835f53ca4789b2659010',
//       type: 'DECLARE',
//       actual_fee: [Object],
//       execution_status: 'SUCCEEDED',
//       finality_status: 'ACCEPTED_ON_L2',
//       messages_sent: [],
//       events: [Array],
//       execution_resources: [Object]
//     },
//     deploy: {
//       transaction_hash: '0x3df83acc98189688765dbbe6e4f3c0b26cbc292967c530488e6ae2f3cbc1045',
//       contract_address: '0x6514990e270b98d65f6357546567729b9c2906fc4bf0699d9bd9f52705d3c6d',
//       address: '0x6514990e270b98d65f6357546567729b9c2906fc4bf0699d9bd9f52705d3c6d',
//       deployer: '0x793feb8c8e0557bbbf6370c0e316091bd9553da5c05de854d78d22859b88454',
//       unique: '0x1',
//       classHash: '0x3003e91bac73b3e58dd00436c0182cf1a73e899fbbb835f53ca4789b2659010',
//       calldata_len: '0x1',
//       calldata: [Array],
//       salt: '0x8cf93e43cb5ae2594a77a5d2a86fb31d64d0bf9dde0ba33f4d8dac3f1ea70c'
//     }
//   }
// }
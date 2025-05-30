import { Account, CallData, Contract, RpcProvider, stark } from "starknet";
import * as dotenv from "dotenv";
import { getCompiledCode } from "./utils";
dotenv.config();

async function main() {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8",
  });

  // initialize existing predeployed account 0
  console.log("ACCOUNT_ADDRESS=", process.env.DEPLOYER_ADDRESS);
  console.log("ACCOUNT_PRIVATE_KEY=", process.env.DEPLOYER_PRIVATE_KEY);
  const privateKey0 = process.env.DEPLOYER_PRIVATE_KEY ?? "";
  const accountAddress0: string = process.env.DEPLOYER_ADDRESS ?? "";
  const account0 = new Account(provider, accountAddress0, privateKey0);
  console.log("Account connected.\n");

  // Declare & deploy contract
  let sierraCode, casmCode;

  try {
    ({ sierraCode, casmCode } = await getCompiledCode("buzzify_Buzzify"));
    //  ({ sierraCode, casmCode } = await getCompiledCode("buzzify_BinaryPredictionMarket"));
    
    // console.log({sierraCode,casmCode})
  } catch (error: any) {
    console.log("Failed to read contract files");
    process.exit(1);
  }

  const myCallData = new CallData(sierraCode.abi);
  // const constructor = myCallData.compile("constructor", {
  //   strk_token_address:
  //     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  // });

  const constructor = myCallData.compile("constructor", {
  strk_token_address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  protocol_fee: 100  // 1% fee (500 basis points) for binary
});

  // console.log({constructor})
  const deployResponse = await account0.declareAndDeploy(
    {
      contract: sierraCode,
      casm: casmCode,
      constructorCalldata: constructor,
      salt: stark.randomAddress(),
    }
  );



  console.log({ deployResponse })

  // Connect the new contract instance :
  const myTestContract = new Contract(
    sierraCode.abi,
    deployResponse.deploy.contract_address,
    provider
  );
  console.log(
    `✅ Contract has been deploy with the address: ${myTestContract.address}`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { constants } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { Bridge, TestToken } from "../typechain";
import { ContractsEnv, execTx, loggedSafeExecTx } from "./lib";

dotenv.config();

task("bridge-swap", "Initialize swap to another network")
    .addOptionalParam("needapprove", "Set to true if token needs approval to swap (default=false)", "false")
    .addParam("chainidto", "Chain id to transfer tokens to")
    .addParam("to", "Recipient's address")
    .addParam("amount", "Token amount to transfer")
    .setAction(async ({needapprove, chainidto, to, amount}, hre) => {
        const bridge0 = await hre.ethers.getContractAt("Bridge", process.env[ContractsEnv[hre.network.name].bridge] ?? "");
        const bridge = bridge0 as unknown as Bridge;
        const testToken0 = await hre.ethers.getContractAt("TestToken", process.env[ContractsEnv[hre.network.name].token] ?? "");
        const testToken = testToken0 as unknown as TestToken;
        const signer = (await hre.ethers.getSigners())[0];

        if (needapprove === "true") {
            console.log("Approving...");
            await loggedSafeExecTx(testToken0, "approve", bridge0.address, amount);
            console.log("Approved");
        }
        
        
        // const filterTranfer = baseToken.filters.TransferSingle(null, constants.AddressZero, owner);
        // baseToken.on(filterTranfer, (operator, from, to, id, value, event) => {
        //     console.log("Transfer happened: ", "\nOperator: ", operator, "\nFrom: ", from, "\nTo: ", to, "\nId: ", id.toHexString(), "\nValue: ", value.toString());
        // });

        // const args = [chainIdTo, await signer.getAddress(), to];
        // const filter = testToken.filters["Transfer"](...args);
        // bridge.on(filter, (...args0) => {
        //     console.log(args0[3]);
            
        // });

        console.log("Swap...");
        await loggedSafeExecTx(bridge0, "swap", chainidto, testToken0.address, to, amount);
        console.log("Finished");
    });
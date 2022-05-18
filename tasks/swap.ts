import { constants } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { Bridge, TestToken } from "../typechain";
import { ContractsEnvConfig, execTx, loggedSafeExecTx } from "./lib";

dotenv.config();

task("bridge-swap", "Initialize swap to another network")
    .addOptionalParam("needapprove", "Set to true if token needs approval to swap (default=false)", "false")
    .addParam("chainidto", "Chain id to transfer tokens to")
    .addParam("to", "Recipient's address")
    .addParam("amount", "Token amount to transfer")
    .setAction(async ({needapprove, chainidto, to, amount}, hre) => {
        const bridge0 = await hre.ethers.getContractAt("Bridge", process.env[ContractsEnvConfig[hre.network.name].bridge] ?? "");
        const bridge = bridge0 as unknown as Bridge;
        const testToken0 = await hre.ethers.getContractAt("TestToken", process.env[ContractsEnvConfig[hre.network.name].token] ?? "");
        const testToken = testToken0 as unknown as TestToken;
        const signer = (await hre.ethers.getSigners())[0];

        if (needapprove === "true") {
            console.log("Approving...");
            await loggedSafeExecTx(testToken0, "approve", bridge0.address, amount);
            console.log("Approved");
        }

        console.log("Swap...");
        await loggedSafeExecTx(bridge0, "swap", chainidto, testToken0.address, to, amount);
        console.log("Finished");
    });
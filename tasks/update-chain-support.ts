import { constants } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { ContractsEnv, execTx, loggedSafeExecTx } from "./lib";

dotenv.config();

task("bridge-update-chain-support", "Add or remove chain support")
    .addParam("chainid", "Chain id")
    .addParam("supported", "True or false")
    .setAction(async ({chainid, supported}, hre) => {
        const bridge0 = await hre.ethers.getContractAt("Bridge", process.env[ContractsEnv[hre.network.name].bridge] ?? "");

        await loggedSafeExecTx(bridge0, "updateChainSupport", chainid, supported);
    });
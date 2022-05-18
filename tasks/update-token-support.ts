import { constants } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { ContractsEnvConfig, execTx, loggedSafeExecTx } from "./lib";

dotenv.config();

task("bridge-update-token-support", "Add or remove token support")
    .addParam("token", "Token address")
    .addParam("supported", "True or false")
    .setAction(async ({token, supported}, hre) => {
        const bridge0 = await hre.ethers.getContractAt("Bridge", process.env[ContractsEnvConfig[hre.network.name].bridge] ?? "");

        await loggedSafeExecTx(bridge0, "updateTokenSupport", token, supported);
    });
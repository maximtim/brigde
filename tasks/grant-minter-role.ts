import { constants } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { Bridge, TestToken } from "../typechain";
import { ContractsEnv, execTx, loggedSafeExecTx } from "./lib";

dotenv.config();

task("token-grant-minter-role", "Grant minter role to account")
    .addParam("to", "Address of minter")
    .setAction(async ({to}, hre) => {
        const token = await hre.ethers.getContractAt("TestToken", process.env[ContractsEnv[hre.network.name].token] ?? "");
        const tokenTyped = token as unknown as TestToken;

        await loggedSafeExecTx(token, "grantRole", await tokenTyped.MINTER_ROLE(), to);
    });
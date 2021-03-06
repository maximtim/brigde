import { constants } from "ethers";
import { formatEther, hashMessage } from "ethers/lib/utils";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { Bridge, TestToken } from "../typechain";
import { ContractsEnvConfig, execTx, loggedSafeExecTx } from "./lib";

dotenv.config();

task("bridge-redeem-test", "Redeem transfered tokens from bridge")
    .addParam("chainidfrom", "Chain id of tokens sender")
    .addParam("from", "Sender's address")
    .addParam("amount", "Token amount")
    .addParam("nonce", "Nonce of swap request")
    .setAction(async ({chainidfrom, from, amount, nonce}, hre) => {
        const bridge0 = await hre.ethers.getContractAt("Bridge", process.env[ContractsEnvConfig[hre.network.name].bridge] ?? "");
        const bridge = bridge0 as unknown as Bridge;
        const testToken0 = await hre.ethers.getContractAt("TestToken", process.env[ContractsEnvConfig[hre.network.name].token] ?? "");
        const testToken = testToken0 as unknown as TestToken;
        const signer = (await hre.ethers.getSigners())[0];

        const hashMsg = hre.ethers.utils.solidityKeccak256(
            ["uint", "address", "address", "address", "uint", "uint"], 
            [chainidfrom, testToken0.address, from, await signer.getAddress(), amount, nonce]
        );
        const signature = await signer.signMessage(hre.ethers.utils.arrayify(hashMsg));
        console.log("Signature:", signature);
        

        console.log("Redeem...");
        await loggedSafeExecTx(bridge0, "redeem", chainidfrom, testToken0.address, from, amount, nonce, signature);
        console.log("Finished");
    });
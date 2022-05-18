import { constants } from "ethers";
import { fetchJson, formatEther, hashMessage } from "ethers/lib/utils";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";
import { Bridge, TestToken } from "../typechain";
import { ContractsEnvConfig, DbRecord, execTx, loggedSafeExecTx } from "./lib";
import { assert } from "console";

dotenv.config();

task("bridge-redeem-prod", "Redeem transferred tokens from bridge using backend (run /scripts/backend.ts)")
    .addParam("chainidfrom", "Chain id of tokens sender")
    .addParam("from", "Sender's address")
    .addParam("amount", "Token amount")
    .addParam("nonce", "Nonce of swap request")
    .setAction(async ({chainidfrom, from, amount, nonce}, hre) => {
        const bridge0 = await hre.ethers.getContractAt("Bridge", process.env[ContractsEnvConfig[hre.network.name].bridge] ?? "");
        const testToken0 = await hre.ethers.getContractAt("TestToken", process.env[ContractsEnvConfig[hre.network.name].token] ?? "");
        const signer = (await hre.ethers.getSigners())[0];
        const signerAddr = await signer.getAddress();

        
        console.log("Requesting signature...");
        const url = "http://127.0.0.1:8080/getall/" + signerAddr + "?pending";
        const pendingTxns = await fetchJson(url) as DbRecord[];
        // console.log(pendingTxns);
        
        const selected = pendingTxns
            .filter((txn) => {
                return txn.pending &&
                    txn.message.chainIdFrom === chainidfrom &&
                    txn.message.tokenTo === testToken0.address &&
                    txn.message.userFrom === from &&
                    txn.message.userTo === signerAddr &&
                    txn.message.amount === amount &&
                    txn.message.nonce === nonce;
            });
        // console.log(selected);
        
        assert(selected.length == 1, "Transaction is not pending or not found");
        const signature = selected[0].signature;
        console.log("Got signature:", signature);

        console.log("Redeem...");
        await loggedSafeExecTx(bridge0, "redeem", chainidfrom, testToken0.address, from, amount, nonce, signature);
        console.log("Finished");
    });
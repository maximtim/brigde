import http from "http";
import hash from "object-hash";
import hre, { artifacts } from "hardhat";
import { config, ethers } from "hardhat";
import { JsonRpcProvider } from "@ethersproject/providers";
import { HardhatRuntimeEnvironment, HttpNetworkConfig } from "hardhat/types";
import { BigNumber, Contract, ContractFactory, Wallet } from "ethers";
import * as dotenv from "dotenv";
import "../tasks/lib";
import { ContractsEnvConfig, DbRecord, Msg } from "../tasks/lib";
import { Bridge } from "../typechain";

dotenv.config();

let db : { 
    [address : string] :
    {
        [hash : string] : 
        DbRecord
    }
} = {};



let tokensMapConfig : {
    [hash: string] : // hash({chainId: BigNumber, token: string})
    {chainId: BigNumber, token: string}
} = {
    [hash({chainId: BigNumber.from(4), token: process.env.TOKEN_ETH_RINKEBY ?? ""})]: 
    {chainId: BigNumber.from(97), token: process.env.TOKEN_BSC ?? ""},

    [hash({chainId: BigNumber.from(97), token: process.env.TOKEN_BSC ?? ""})]: 
    {chainId: BigNumber.from(4), token: process.env.TOKEN_ETH_RINKEBY ?? ""},
};

//////////////////////////////////////////////

async function bindEvents({name, url, chainId} : {name: string, url: string, chainId: number}) {
    const bridgeAddr = process.env[ContractsEnvConfig[name].bridge] ?? "";
    const validatorKey = process.env[ContractsEnvConfig[name].validatorKey] ?? "";

    const provider = new JsonRpcProvider(url, chainId);
    const art = await artifacts.readArtifact("Bridge");
    const bridge = new Contract(bridgeAddr ?? "", art.abi, provider) as unknown as Bridge;
    const validator = new Wallet(validatorKey ?? "");
    // console.log(validator);
    

    

    const swapFilter = bridge.filters.SwapInitialised();
    bridge.on(swapFilter, (chainIdTo, from, to, tokenFrom, amount, nonce) => {
        const {token: tokenTo} = tokensMapConfig[hash({chainId: BigNumber.from(chainId), token: tokenFrom})];

        const msg : Msg = {
            chainIdFrom: chainId.toString(),
            chainIdTo: chainIdTo.toString(),
            tokenFrom: tokenFrom,
            tokenTo: tokenTo,
            userFrom: from,
            userTo: to,
            amount: amount.toString(),
            nonce: nonce.toString()
        };

        const hashMsg = hash(msg);
        db[to] ??= {};

        if (db[to][hashMsg] == undefined) {
            const hashMsgSign = hre.ethers.utils.solidityKeccak256(
                ["uint", "address", "address", "address", "uint", "uint"],
                [chainId, tokenTo, from, to, amount, nonce]
            );
            validator.signMessage(hre.ethers.utils.arrayify(hashMsgSign))
                .then((signature) => {
                    db[to][hashMsg] = {message: msg, signature: signature, pending: true};

                    ///////
                    console.log("SwapInitialised:");
                    console.log(db[to][hashMsg]);
                });
        }
    });

    const redeemFilter = bridge.filters.RedeemCompleted();
    bridge.on(redeemFilter, (chainIdFrom, from, to, tokenTo, amount, nonce) => {
        const {token: tokenFrom} = tokensMapConfig[hash({chainId: BigNumber.from(chainId), token: tokenTo})];

        const msg : Msg = {
            chainIdFrom: chainIdFrom.toString(),
            chainIdTo: chainId.toString(),
            tokenFrom: tokenFrom,
            tokenTo: tokenTo,
            userFrom: from,
            userTo: to,
            amount: amount.toString(),
            nonce: nonce.toString()
        };

        const hashMsg = hash(msg);
        db[to] ??= {};

        if (db[to][hashMsg] == undefined) {
            db[to][hashMsg] = {message: msg, signature: "", pending: false};

            ///////
            console.log("RedeemCompleted:");
            console.log(db[to][hashMsg]);
        }
        else if (db[to][hashMsg]?.pending == true) {
            db[to][hashMsg].pending = false;

            ///////
            console.log("RedeemCompleted:");
            console.log(db[to][hashMsg]);
        }
    });

    console.log("Binded events:", name, chainId);
}

async function main() {
    const rinkeby = config.networks.rinkeby as HttpNetworkConfig;
    const bscTest = config.networks.bscTestnet as HttpNetworkConfig;

    await bindEvents({name: "rinkeby", chainId: 4, url: rinkeby.url});
    await bindEvents({name: "bscTestnet", chainId: 97, url: bscTest.url});
    
    
    
    http.createServer(
        (request, response) => {
            request.on('error', (err) => {
                console.error(err);
                response.statusCode = 400;
                response.end();
            });
            response.on('error', (err) => {
                console.error(err);
            });

            response.statusCode = 200;
            const url = request.url;

            if (url?.startsWith("/getall/")) {
                const args = url.split('/');
                if (args.length != 3) {
                    help(); 
                    return;
                }

                response.setHeader('Content-Type', 'application/json');

                const argsReq = args[2].split('?');
                if (argsReq.length > 2) {
                    help();
                } 
                else if (argsReq.length == 1) {
                    const address = argsReq[0];
                    const dbRecord = db[address] ?? {};

                    response.end(JSON.stringify(dbRecord));
                } 
                else if (argsReq.length == 2 && argsReq[1] == "pending") {
                    const address = argsReq[0];
                    const dbRecord = db[address] ?? {};
                    
                    const pending = Object.keys(dbRecord)
                        .filter(key => dbRecord[key].pending)
                        .map(key => dbRecord[key]);

                    response.end(JSON.stringify(pending));
                } 
                else {
                    help();
                }
            } else {
                help();
            }

            function help() {
                response.write("Help:\n");
                response.write("/getall/<address> - show all your bridge swaps with signatures\n");
                response.write("/getall/<address>?pending - show only pending (unfinished) swaps\n");
                response.end();
            }
        }
    ).listen(8080, () => {
        console.log("Server started.");
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});




import http from "http";
import hash from "object-hash";
import hre, { artifacts } from "hardhat";
import { config, ethers } from "hardhat";
import { JsonRpcProvider } from "@ethersproject/providers";
import { HttpNetworkConfig } from "hardhat/types";
import { Contract, ContractFactory } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

let db : { 
    [key : string] 
    : 
    {signature: string, pending: boolean}
} = {};

const bscTest = config.networks.bscTestnet as HttpNetworkConfig;

async function main() {
    // console.log(hre.network.config);
    // console.log(ethers.providers.getNetwork(97));
    const prov = new JsonRpcProvider(bscTest.url, bscTest.chainId);
    // console.log(prov);
    //console.log(await prov.getBlockNumber());new Contract()

    // const ifc = await artifacts.readArtifact("TestToken");
    // const token = new Contract(process.env.TOKEN_BSC ?? "", ifc.abi, prov) as unknown as TestToken;

    // console.log(await token.name());
    console.log(hre.network);
    // console.log(hre.network);
    
    
    
    // http.createServer(
    //    (req, res) => {
    //        res.end("hello world!");
    //    }
    // ).listen(8080);
    
    
    
    //const provider = ethers.getDefaultProvider();
    // console.log(hre.network.config);
    // console.log(provider.network);
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});




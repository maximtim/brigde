import { Contract, ContractTransaction } from "ethers";

export function delay(n : number){
  return new Promise(function(resolve){
      setTimeout(resolve,n*1000);
  });
}

export async function execTx(txPromise : Promise<ContractTransaction>) {
  const tx = await txPromise;
  return await tx.wait();
}

export async function loggedSafeExecTx(contract : Contract, funcName : string, ...args : any[]) {
  await contract.callStatic[funcName](...args);
  console.log("Callstatic success");

  const txRes = await execTx(contract.functions[funcName](...args));
  console.log("Gas:", txRes.gasUsed.toString());

  const eventLogs = txRes.events?.map(ev => {
    let eventLog : { 
      signature : string,
      args : {[k: string] : string}
    } = {
      signature: ev.eventSignature!,
      args: {}
    };
    
    Object.keys(ev.args ?? {})
      .filter(k => isNaN(parseInt(k)))
      .forEach(key => {
        eventLog.args[key] = ev.args![key].toString();
      });
    return eventLog;
  });
  console.log("Txn hash:", txRes.transactionHash);
  console.log("Event logs:", eventLogs);
  // console.log("Event logs full:", txRes.events);
}

export type Contracts = { bridge: string, token: string, validatorKey: string };
export const ContractsEnvConfig : {
  [networkName: string] : Contracts
} = {
  "rinkeby" : {bridge: "BRIDGE_ETH_RINKEBY", token: "TOKEN_ETH_RINKEBY", validatorKey: "VALIDATOR_KEY"},
  "bscTestnet" : {bridge: "BRIDGE_BSC", token: "TOKEN_BSC", validatorKey: "VALIDATOR_KEY"}
};

export type Msg = {
  chainIdFrom: string,
  chainIdTo: string,
  tokenFrom: string,
  tokenTo: string,
  userFrom: string,
  userTo: string,
  amount: string,
  nonce: string
};

export type DbRecord = {message: Msg, signature: string, pending: boolean};

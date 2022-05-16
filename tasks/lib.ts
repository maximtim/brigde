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
  console.log("Event logs:", eventLogs);
  console.log("Event logs full:", txRes.events);
}

export type Contracts = { bridge: string, token: string };
export const ContractsEnv : {
  [networkName: string] : Contracts
} = {
  "rinkeby" : {bridge: "BRIDGE_ETH_RINKEBY", token: "TOKEN_ETH_RINKEBY"},
  "bscTestnet" : {bridge: "BRIDGE_BSC", token: "TOKEN_BSC"}
};

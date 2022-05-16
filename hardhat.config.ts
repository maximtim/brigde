import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

import "./tasks";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.PROJECT_URL,
      accounts: JSON.parse(process.env.PRIVATE_KEYS_LIST !== undefined ? process.env.PRIVATE_KEYS_LIST : ""),
      gas: 5000_000,
      gasPrice: 8000000000
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gas: 5000_000,
      gasPrice: 20000000000,
      accounts: JSON.parse(process.env.PRIVATE_KEYS_LIST !== undefined ? process.env.PRIVATE_KEYS_LIST : "")
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

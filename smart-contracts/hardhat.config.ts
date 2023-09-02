import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const {
  PRIVATE_KEY,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    celo: {
      url: "https://forno.celo.org",
      gasPrice: 10000000000,
      accounts: [PRIVATE_KEY || ""]
    },
  }
};

export default config;

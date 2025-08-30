import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'; // automatically loads .env

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Hardhat or Ganache local RPC
    },
    /*
    goerli: {
      url: process.env.ALCHEMY_URL, // set in your .env
      accounts: [process.env.MY_WALLET_PRIVATE_KEY], // set in your .env
    }
    */
  },
};

export default config;

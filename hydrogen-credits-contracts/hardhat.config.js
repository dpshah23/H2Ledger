require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    /*
    goerli: {
      url: process.env.ALCHEMY_URL,       // remove or fix this
      accounts: [process.env.MY_WALLET_PRIVATE_KEY] // remove or fix this
    }
    */

     localhost: {
      url: "http://127.0.0.1:8545", // Hardhat or Ganache local RPC
    },
  }
};

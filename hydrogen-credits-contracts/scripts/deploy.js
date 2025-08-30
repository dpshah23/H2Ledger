<<<<<<< HEAD
import { ethers } from "hardhat";

async function main() {
  const HydrogenCredits = await ethers.getContractFactory("HydrogenCredits");

  // Deploy with constructor arguments: name, symbol, initial supply
  const contract = await HydrogenCredits.deploy("HydroToken", "HGC", 1000000);

  // Wait for deployment
=======
import hre from "hardhat";

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Deploy the contract
  const HydrogenCredits = await hre.ethers.getContractFactory("HydrogenCredits");
  const contract = await HydrogenCredits.deploy(deployer.address); // pass owner

  // Wait until the contract is deployed
>>>>>>> 651d79700548682a98364cdc1824771b4b76693d
  await contract.waitForDeployment();

  console.log("HydrogenCredits deployed to:", contract.target);
}

// Run the script and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

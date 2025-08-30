import { ethers } from "hardhat";

async function main() {
  const HydrogenCredits = await ethers.getContractFactory("HydrogenCredits");

  // Deploy with constructor arguments: name, symbol, initial supply
  const contract = await HydrogenCredits.deploy("HydroToken", "HGC", 1000000);

  // Wait for deployment
  await contract.waitForDeployment();

  console.log("HydrogenCredits deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

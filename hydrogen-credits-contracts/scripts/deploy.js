import hre from "hardhat";

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Deploy the contract
  const HydrogenCredits = await hre.ethers.getContractFactory("HydrogenCredits");
  const contract = await HydrogenCredits.deploy(deployer.address); // pass owner

  // Wait until the contract is deployed
  await contract.waitForDeployment();

  console.log("HydrogenCredits deployed to:", await contract.getAddress());
}

// Run the script and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

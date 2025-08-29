const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const HydrogenCredits = await hre.ethers.getContractFactory("HydrogenCredits");
  const contract = await HydrogenCredits.deploy(deployer.address); // pass owner

  await contract.waitForDeployment(); // ✅ correct for ethers v6

  console.log("HydrogenCredits deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "ethers";
import HydrogenCreditsJSON from "../../../hydrogen-credits-contracts/artifacts/contracts/HydrogenCredits.sol/HydrogenCredits.json";

export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_ADDRESS_HERE";

export const getContract = (providerOrSigner: ethers.BrowserProvider | ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, HydrogenCreditsJSON.abi, providerOrSigner);
};

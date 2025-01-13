import { BrowserProvider, Contract } from "ethers";
import DonationTokenData from "../abi/DonationToken.json";
import FundraisingData from "../abi/Fundraising.json";
import contractAddresses from "../abi/contractAddresses.json"; // Import adresele 

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Initializez contractele
const DonationTokenContract = new Contract(
  contractAddresses.DonationToken, 
  DonationTokenData.abi,
  signer
);

const FundraisingContract = new Contract(
  contractAddresses.Fundraising, 
  FundraisingData.abi,
  signer
);

export { provider, signer, DonationTokenContract, FundraisingContract };

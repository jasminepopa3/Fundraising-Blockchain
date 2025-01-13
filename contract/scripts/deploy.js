const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const DonationToken = await ethers.getContractFactory("DonationToken");
    const donationToken = await DonationToken.deploy();
    const donationTokenAddress = await donationToken.getAddress();

    
    console.log("DonationToken deployed to:", donationTokenAddress);

    const Fundraising = await ethers.getContractFactory("Fundraising");
    const fundraising = await Fundraising.deploy(donationTokenAddress, 600); // 10m fundraising
    const fundraisingAddress = await fundraising.getAddress();

    console.log("Fundraising deployed to:", fundraisingAddress);

    // Paths pentru ABI files si destination folder
    const abiFolder = path.join(__dirname, "../artifacts/contracts/Fundraising.sol");
    const abiDestination = path.join(__dirname, "../../client/src/abi");

      // Creez fisierul de destinatie daca nu exista
      if (!fs.existsSync(abiDestination)) {
        fs.mkdirSync(abiDestination, { recursive: true });
      }

      // Copiez adresele si ABI-urile
      const contracts = [
        { name: "DonationToken", address: donationTokenAddress },
        { name: "Fundraising", address: fundraisingAddress },
      ];

      contracts.forEach(({ name }) => {
        const abiPath = path.join(abiFolder, `${name}.json`);
        const destinationPath = path.join(abiDestination, `${name}.json`);
        if (fs.existsSync(abiPath)) {
          fs.copyFileSync(abiPath, destinationPath);
          console.log(`ABI for ${name} copied to: ${destinationPath}`);
        } else {
          console.error(`ABI file for ${name} not found at: ${abiPath}`);
        }
      });

      const contractAddresses = {
        DonationToken: donationTokenAddress,
        Fundraising: fundraisingAddress,
      };

      const addressesPath = path.join(abiDestination, "contractAddresses.json");
      fs.writeFileSync(addressesPath, JSON.stringify(contractAddresses, null, 2));

      console.log("Contract addresses saved to:", addressesPath);
  
      //Informatiile deployer-ului
      const deployerInfo = {
          address: deployer.address,
          privateKey: deployer.privateKey, 
      };

      const deployerInfoPath = path.join(__dirname, "../../client/src/deployerInfo.json");
      fs.writeFileSync(deployerInfoPath, JSON.stringify(deployerInfo, null, 2));

      console.log("Deployer information saved to:", deployerInfoPath);

      console.log("Deployment and ABI export completed.");
  }

  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
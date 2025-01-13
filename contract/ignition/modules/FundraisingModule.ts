import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FundraisingModule = buildModule("FundraisingModule", (m) => {
  const fundraisingGoal = m.getParameter("fundraisingGoal", 1000); // De exemplu, obiectivul de strângere de fonduri
  const tokenAddress = m.getParameter("tokenAddress", "0xTokenAddress"); // Adresa token-ului de donații
  const duration = m.getParameter("duration", 60); // Durata fundraising-ului în secunde
  
  const fundraisingContract = m.contract("Fundraising", [tokenAddress, duration]);

  return { fundraisingContract };
});

export default FundraisingModule;

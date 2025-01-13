import React, { useState } from "react";
import { provider, DonationTokenContract, FundraisingContract } from "./utils/Web3Config";
import { formatEther, parseEther } from "ethers";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [allowanceAmount, setAllowanceAmount] = useState("0");
  const [userTokenBalance, setUserTokenBalance] = useState("0");
  const [selectedCause, setSelectedCause] = useState("");
  const [totalFunds, setTotalFunds] = useState("0");
  const [fundraisingEnd, setFundraisingEnd] = useState("0");
  const [votingEndTime, setVotingEndTime] = useState("0");
  const [calculatedPercentage, setCalculatedPercentage] = useState("0");

  const connectWallet = async () => {
    try {
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const ethBalance = await provider.getBalance(address);
      setBalance(formatEther(ethBalance));
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const donate = async () => {
    try {
      const tx = await FundraisingContract.donate({ value: 100 });
      await tx.wait();
      console.log("Donation of 100 wei successful!");
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  const approveTokens = async () => {
    try {
      const amount = parseEther("100000");
      const tx = await DonationTokenContract.approve(FundraisingContract.target, amount);
      await tx.wait();
      console.log("Approve successful!");
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  const checkAllowance = async () => {
    try {
      const allowance = await DonationTokenContract.allowance(
        account,
        FundraisingContract.target
      );
      setAllowanceAmount(formatEther(allowance));
      console.log(`Allowance is: ${formatEther(allowance)} DNT`);
    } catch (error) {
      console.error("Error checking allowance:", error);
    }
  };

  const fundWithTokens = async () => {
    try {
      const amount = parseEther("100000");
      const tx = await FundraisingContract.fundWithTokens(amount);
      await tx.wait();
      console.log("Fund with tokens successful!");
    } catch (error) {
      console.error("Error funding with tokens:", error);
    }
  };

  const startVoting = async () => {
    try {
      const causes = ["Cause1", "Cause2"];
      const addresses = [
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      ];

      const tx = await FundraisingContract.startVoting(causes, addresses);
      await tx.wait();
      console.log("Voting started successfully!");
    } catch (error) {
      console.error("Error starting voting:", error);
    }
  };

  const vote = async () => {
    try {
      if (!selectedCause) {
        console.log("Please select a cause to vote for!");
        return;
      }

      const tx = await FundraisingContract.vote(selectedCause);
      await tx.wait();
      console.log(`Voted for cause: ${selectedCause}`);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const checkTokenBalance = async () => {
    try {
      const balance = await DonationTokenContract.balanceOf(account);
      setUserTokenBalance(formatEther(balance));
      console.log(`User's DNT balance: ${formatEther(balance)} DNT`);
    } catch (error) {
      console.error("Error checking token balance:", error);
    }
  };

  const distributeFunds = async () => {
    try {
      const tx = await FundraisingContract.distributeFunds();
      await tx.wait();
      console.log("Funds distributed successfully!");
    } catch (error) {
      console.error("Error distributing funds:", error);
    }
  };

  const getTotalFunds = async () => {
    try {
      const funds = await FundraisingContract.totalFunds();
      setTotalFunds(formatEther(funds));
      console.log(`Total Funds: ${formatEther(funds)} ETH`);
    } catch (error) {
      console.error("Error fetching total funds:", error);
    }
  };

  const calculatePercentage = async () => {
    try {
      const donation = parseEther("1"); // Exemplu 1 din 10 ETH
      const total = parseEther("10"); 
      const percentage = await FundraisingContract.calculatePercentage(donation, total);
      setCalculatedPercentage(percentage.toString());
      console.log(`Percentage: ${percentage.toString()}%`);
    } catch (error) {
      console.error("Error calculating percentage:", error);
    }
  };

  const getFundraisingEnd = async () => {
    try {
      const endTime = await FundraisingContract.fundraisingEnd();
      setFundraisingEnd(endTime.toString());
      console.log(`Fundraising End Time: ${endTime.toString()}`);
    } catch (error) {
      console.error("Error fetching fundraising end time:", error);
    }
  };

  const getVotingEndTime = async () => {
    try {
      const endTime = await FundraisingContract.votingEndTime();
      setVotingEndTime(endTime.toString());
      console.log(`Voting End Time: ${endTime.toString()}`);
    } catch (error) {
      console.error("Error fetching voting end time:", error);
    }
  };

  const stopFundraising = async () => {
    try {
      const tx = await FundraisingContract.stopFundraising();
      await tx.wait();
      console.log("Fundraising stopped successfully!");
    } catch (error) {
      console.error("Error stopping fundraising:", error);
    }
  };
  
  const stopVoting = async () => {
    try {
      const tx = await FundraisingContract.stopVoting();
      await tx.wait();
      console.log("Voting stopped successfully!");
    } catch (error) {
      console.error("Error stopping voting:", error);
    }
  };
  

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Fundraising DApp</h1>
        {!account ? (
          <button onClick={connectWallet} className="connect-wallet-button">
            Connect Wallet
          </button>
        ) : (
          <div className="account-info">
            <p>Connected Account: {account}</p>
            <p>ETH Balance: {balance} ETH</p>
          </div>
        )}
      </header>

      <div className="content-container">
        <div className="column owner-functions">
          <h2>Owner Functions</h2>
          <button onClick={fundWithTokens}>Fund with Tokens</button>
          <button onClick={startVoting}>Start Voting</button>
          <button onClick={stopFundraising}>Stop Fundraising</button>
          <button onClick={stopVoting}>Stop Voting</button>
          <button onClick={distributeFunds}>Distribute Funds</button>
        </div>

        <div className="column shared-functions">
          <h2>Shared Functions</h2>
          <button onClick={approveTokens}>Approve 100000 DNT</button>
          <button onClick={getTotalFunds}>Get Total Funds</button>
          <p>Total Funds: {totalFunds} ETH</p>
          <button onClick={calculatePercentage}>Calculate Percentage</button>
          <p>Calculated Percentage: {calculatedPercentage}%</p>
          <button onClick={getFundraisingEnd}>Get Fundraising End</button>
          <p>Fundraising End Time: {fundraisingEnd}</p>
          <button onClick={getVotingEndTime}>Get Voting End</button>
          <p>Voting End Time: {votingEndTime}</p>
        </div>

        <div className="column donor-functions">
          <h2>Donor Functions</h2>
          <button onClick={donate}>Donate 100 wei</button>
          <input
            type="text"
            placeholder="Enter cause to vote for"
            value={selectedCause}
            onChange={(e) => setSelectedCause(e.target.value)}
            className="input-cause"
          />
          <button onClick={vote}>Vote</button>
          <button onClick={checkAllowance}>Transfer Allowance to Fundraising Contract</button>
          <p>Allowance: {allowanceAmount} DNT</p>
          <button onClick={checkTokenBalance}>Check Token Balance</button>
          <p>Token Balance: {userTokenBalance} DNT</p>
        </div>
      </div>
    </div>
  );
}

export default App;

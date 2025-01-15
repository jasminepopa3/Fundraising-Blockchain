# 💸 DApp Fundraising Platform  

A **decentralized fundraising application** built with Solidity smart contracts and Web3 technology. This project allows users to securely donate, vote for causes, and distribute funds based on community decisions.

---

## ✨ Features  

- 🪙 **Custom ERC20 Token**: Rewards donors with tokens proportional to their donations.  
- 💰 **Clear Fundraising**: Collect ETH donations with the ability to check total funds. 
- ✅ **Community Voting**: Token-based voting system to decide fund allocation.  
- 🔒 **Secure Fund Distribution**: Funds are distributed proportionally based on votes.  

---

## 🎯 Objectives Checklist  

The project implements the following requirements from the specification:

### Part 1: Smart Contracts

- [x] **Use of Solidity-specific data types (mappings, address)**  
  - Example:  
    ```solidity
    address public tokenAddress;
    mapping(address => uint256) public donations;
    mapping(string => uint256) public votes;
    mapping(string => address) public causeAddresses;
    ```
- [x] **Event logging**  
  - Events such as `DonationReceived`, `VotingStarted`, and `FundsDistributed` are declared and emitted. Example:  
    ```solidity
    event DonationReceived(address indexed donor, uint256 amount);
    event VotingStarted(uint256 endTime);
    event CauseVoted(string cause, uint256 votes);
    event FundsDistributed(string cause, uint256 amount, address recipient);
    ```
- [x] **Use of modifiers**  
  - Modifiers like `fundraisingActive` and `onlyAfterFundraisingEnded` are used. Example:  
    ```solidity
    modifier fundraisingActive() {
        require(!fundraisingStopped, "Fundraising has been stopped by the owner!");
        _;
    }

    modifier votingActive() {
        require(!votingStopped, "Voting has been stopped by the owner!");
        _;
    }

    modifier onlyAfterFundraisingEnded() {
        require(
            block.timestamp > fundraisingEnd || fundraisingStopped,
            "Fundraising is still active!"
        );
        _;
    }

    modifier onlyAfterVotingEnded() {
        require(
            block.timestamp > votingEndTime || votingStopped,
            "Voting is still active!"
        );
        _;
    }
    ```
- [x] **Function types: external, pure, view**  
  - Demonstrated in the contract. Example:  
    ```solidity
    function vote(string calldata cause) external onlyAfterFundraisingEnded votingActive {
        require(DonationToken(tokenAddress).balanceOf(msg.sender) > 0, "No token to vote with!");
        require(_causeExists(cause), "Cause not found!");

        uint256 voterBalance = DonationToken(tokenAddress).balanceOf(msg.sender);
        votes[cause] += voterBalance;

        DonationToken(tokenAddress).transferFrom(msg.sender, address(this), voterBalance);

        emit CauseVoted(cause, votes[cause]);
    }
    
    function calculatePercentage(uint256 donation, uint256 total) public pure returns (uint256) {
        require(total > 0, "Total must be greater than zero!");
        return (donation * 100) / total;
    }
    
    function _causeExists(string memory cause) internal view returns (bool){
        for(uint256 i = 0; i < causes.length; i++){
            if(keccak256(bytes(causes[i])) == keccak256(bytes(cause))){
                return true;
            }
        }
        return false;
    }
    ```
- [x] **ETH transfers**  
  - ETH is handled in the `donate` and `distributeFunds` functions. Example:  
    ```solidity
    function donate() external payable fundraisingActive {
        require(block.timestamp < fundraisingEnd, "Fundraising ended!");
        require(msg.value > 0, "Donation must be greater than zero!");
        donations[msg.sender] += msg.value;
        totalFunds += msg.value;

        uint256 tokensToTransfer = msg.value; // tokeni pentru fiecare suma donata
        DonationToken(tokenAddress).transfer(msg.sender, tokensToTransfer);

        emit DonationReceived(msg.sender, msg.value);
    }
    
    function distributeFunds() external onlyOwner onlyAfterFundraisingEnded onlyAfterVotingEnded  {
        uint256 totalVotes = _getTotalVotes();
        require(totalVotes > 0, "No votes to distribute!");

        for (uint256 i = 0; i < causes.length; i++) {
            string memory cause = causes[i];
            address recipient = causeAddresses[cause];
            uint256 causeVotes = votes[cause];

            if (causeVotes > 0) {
                uint256 causeShare = (totalFunds * causeVotes) / totalVotes;

                (bool success, ) = recipient.call{value: causeShare}("");
                require(success, "Transfer failed!");

                emit FundsDistributed(cause, causeShare, recipient);
            }
        }

        totalFunds = 0;
    }
    
    ```
- [x] **Interaction between smart contracts**  
  - The `DonationToken` ERC20 contract is used within `Fundraising.sol`. Example:  
   ```solidity
    function vote(string calldata cause) external onlyAfterFundraisingEnded votingActive {
        require(DonationToken(tokenAddress).balanceOf(msg.sender) > 0, "No token to vote with!");
        require(_causeExists(cause), "Cause not found!");

        uint256 voterBalance = DonationToken(tokenAddress).balanceOf(msg.sender);
        votes[cause] += voterBalance;

        DonationToken(tokenAddress).transferFrom(msg.sender, address(this), voterBalance);

        emit CauseVoted(cause, votes[cause]);
    }
    ```
- [x] **Library Usage**  
  - Used OpenZeppelin's ERC20 implementation for the `DonationToken` contract. Example:  
    ```solidity
    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    ```
- [x] **Inheritance**  
  - Demonstrated with OpenZeppelin’s `ERC20` and `Ownable` in `DonationToken` and `Fundraising`. Example:  
    ```solidity
    contract DonationToken is ERC20 {
        constructor() ERC20("DonationToken", "DNT") payable {
            _mint(msg.sender, 1000000 * (10 ** decimals())); 
        }
    }

    contract Fundraising is Ownable{
      address public tokenAddress;
      uint256 public totalFunds;
      uint256 public fundraisingEnd;
      ...
   
    ```
- [x] **Standard ERC Implementation**  
  - Followed the ERC20 standard for `DonationToken`, ensuring compatibility with Ethereum wallets and dApps.
### Part 2: Web3 Interaction  

- [x] **Use of a Web3 library (Ethers.js)**  
  - The frontend connects to the Ethereum network and fetches wallet details. Example:  
    ```javascript
    const connectWallet = async () => {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log("Connected wallet:", address);
    };
    ```
- [x] **Transaction initiation**  
  - Users can donate or vote using transactions. Example:  
    ```javascript
    const tx = await FundraisingContract.donate({ value: 100 });
    await tx.wait();

    const tx = await FundraisingContract.vote(selectedCause);
    await tx.wait();
    ```

---

## 🔧 Deployment & Testing  

1. **Local Network Setup**:  
   - Started a local Ethereum network using Hardhat:  
     ```bash
     npx hardhat node
     ```  

2. **Contract Deployment**:  
   - Deployed smart contracts to the local network:  
     ```bash
     npx hardhat run scripts/deploy.js
     ```  

3. **Testing**:  
   - Ran tests to verify contract functionality:  
     ```bash
     npx hardhat test > test-results.txt
     ```  
   - Test results are saved in `test-results.txt`.  

4. **Frontend Interaction**:  
   - Connected to the local network using MetaMask.  
   - Used accounts generated by Hardhat for testing transactions.  

5. **Frontend Launch**:  
   - Started the React-based frontend:  
     ```bash
     npm start
     ```  
   - Allowed users to interact with deployed contracts via MetaMask.  




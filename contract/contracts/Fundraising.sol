// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationToken is ERC20{
    constructor() ERC20("DonationToken", "DNT") payable{
         _mint(msg.sender, 1000000 * (10 ** decimals())); 
    }
}

contract Fundraising is Ownable{
    address public tokenAddress;
    uint256 public totalFunds;
    uint256 public fundraisingEnd;
    uint256 public votingEndTime;
    mapping(address => uint256) public donations;
    mapping(string => uint256) public votes;
    mapping(string => address) public causeAddresses; 
    string[] public causes;

    event DonationReceived(address indexed donor, uint256 amount);
    event VotingStarted(uint256 endTime);
    event CauseVoted(string cause, uint256 votes);
    event FundsDistributed(string cause, uint256 amount, address recipient);

    modifier onlyAfterFundraisingEnded() {
        require(block.timestamp > fundraisingEnd, "Fundraising is still active!");
        _;
    }

    modifier onlyAfterVotingEnded() {
    require(block.timestamp > votingEndTime, "Voting is still active!");
    _;
}


    constructor(address _tokenAddress, uint256 _duration) Ownable(msg.sender){
        tokenAddress = _tokenAddress;
        fundraisingEnd = block.timestamp + _duration;
    }

    function donate() external payable {
    require(block.timestamp < fundraisingEnd, "Fundraising ended!");
    require(msg.value > 0, "Donation must be greater than zero!");
    donations[msg.sender] += msg.value;
    totalFunds += msg.value;

    uint256 tokensToTransfer = msg.value; // 1 token pentru fiecare wei donat
    DonationToken(tokenAddress).transfer(msg.sender, tokensToTransfer);

    emit DonationReceived(msg.sender, msg.value);
}


    function startVoting(string[] calldata _causes, address[] calldata _addresses) 
        external 
        onlyOwner 
        onlyAfterFundraisingEnded 
    {
        require(_causes.length > 0, "No causes provided!");
        require(_causes.length == _addresses.length, "Causes and addresses length mismatch!");

        for (uint256 i = 0; i < causes.length; i++) {
            delete causeAddresses[causes[i]];
        }
        delete causes;

        for (uint256 i = 0; i < _causes.length; i++) {
            causes.push(_causes[i]);
            causeAddresses[_causes[i]] = _addresses[i];
        }

         votingEndTime = block.timestamp + 300; // 5 minute
         emit VotingStarted(votingEndTime);
    }


    function vote(string calldata cause) external onlyAfterFundraisingEnded{
        require(DonationToken(tokenAddress).balanceOf(msg.sender) > 0, "No token to vote with!");
        require(_causeExists(cause), "Cause not found!");

        uint256 voterBalance = DonationToken(tokenAddress).balanceOf(msg.sender);
        votes[cause] += voterBalance;

        DonationToken(tokenAddress).transferFrom(msg.sender, address(this), voterBalance);

        emit CauseVoted(cause, votes[cause]);
    }

    function _causeExists(string memory cause) internal view returns (bool){
        for(uint256 i = 0; i < causes.length; i++){
            if(keccak256(bytes(causes[i])) == keccak256(bytes(cause))){
                return true;
            }
        }
        return false;
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

     function _getTotalVotes() internal view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < causes.length; i++) {
            total += votes[causes[i]];
        }
        return total;
    }



    function fundWithTokens(uint256 amount) external onlyOwner {
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
    }

}
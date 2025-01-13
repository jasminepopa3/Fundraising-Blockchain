import { ethers } from "hardhat";
import { expect } from "chai";
import { network } from "hardhat";


describe("Fundraising Contract", function () {
  let DonationToken, donationToken, Fundraising, fundraising;
  let owner, addr1, addr2, addr3, cause1Address, cause2Address;

  it("Should deploy contracts, approve funds, allow donations, track total donations, start voting, cast votes, and distribute funds", async function () {
    // Preiau conturile de owner, donors, causes
    [owner, addr1, addr2, addr3, cause1Address, cause2Address] = await ethers.getSigners();

    // Afisez adresa owner-ului
    console.log("Owner Address:", owner.address);

    // Deploy DonationToken
    DonationToken = await ethers.getContractFactory("DonationToken");
    donationToken = await DonationToken.deploy();
    await donationToken.waitForDeployment();

    // Afisez adresa contractului DonationToken
    console.log("DonationToken Address:", donationToken.target);

    // Deploy Fundraising
    Fundraising = await ethers.getContractFactory("Fundraising");
    fundraising = await Fundraising.deploy(donationToken.target, 600); // 10 minute durata
    await fundraising.waitForDeployment();

    // Afisez adresa contractului Fundraising
    console.log("Fundraising Contract Address:", fundraising.target);

    // Owner aproba transferul de 1000 tokenuri catre contractul Fundraising
    const approveAmount = ethers.parseEther("1000");
    await donationToken.connect(owner).approve(fundraising.target, approveAmount);

    console.log(`Metoda approve pentru adresa [${fundraising.target}] și valoarea 1000 tokens a fost approved`);

    // Owner finanteaza contractul Fundraising cu 1000 tokenuri
    await fundraising.connect(owner).fundWithTokens(approveAmount);

    console.log(`Metoda fundWithTokens pentru contractul [${fundraising.target}] cu valoarea 1000 tokens a fost executată`);

    // Verific totalul fondurilor inainte de donatii
    let totalRaised = await fundraising.totalFunds();
    console.log("Total Funds Before Donations:", ethers.formatEther(totalRaised));

    // Donatorii doneaza catre Fundraising
    console.log("Donator Address (addr1):", addr1.address);
    await fundraising.connect(addr1).donate({ value: ethers.parseEther("1") });
    console.log(`A votat cu succes ${ethers.parseEther("1")} ethers`);

    // Verific totalul fondurilor dupa prima donatie
    totalRaised = await fundraising.totalFunds();
    console.log("Total Funds After addr1 Donation:", ethers.formatEther(totalRaised));

    console.log("Donator Address (addr2):", addr2.address);
    await fundraising.connect(addr2).donate({ value: ethers.parseEther("2") });
    console.log(`A votat cu succes ${ethers.parseEther("2")} ethers`);

    // Verific totalul fondurilor dupa a doua donație
    totalRaised = await fundraising.totalFunds();
    console.log("Total Funds After addr2 Donation:", ethers.formatEther(totalRaised));

    console.log("Donator Address (addr3):", addr3.address);
    await fundraising.connect(addr3).donate({ value: ethers.parseEther("3") });
    console.log(`A votat cu succes ${ethers.parseEther("3")} ethers`);

    // Verific totalul fondurilor dupa a treia donatie
    totalRaised = await fundraising.totalFunds();
    console.log("Total Funds After addr3 Donation:", ethers.formatEther(totalRaised));

    // Verific balantele in DonationToken pentru fiecare donor
    const balance1 = await donationToken.balanceOf(addr1.address);
    const balance2 = await donationToken.balanceOf(addr2.address);
    const balance3 = await donationToken.balanceOf(addr3.address);

    // Afisez balantele pentru fiecare donor
    console.log("DonationToken Balance for addr1:", ethers.formatEther(balance1));
    console.log("DonationToken Balance for addr2:", ethers.formatEther(balance2));
    console.log("DonationToken Balance for addr3:", ethers.formatEther(balance3));

    // Verific totalul donatiilor finale
    totalRaised = await fundraising.totalFunds();
    console.log("Total Funds After All Donations:", ethers.formatEther(totalRaised));

    // Verific dacă totalul donatiilor este corect (6 ETH)
    expect(totalRaised).to.equal(ethers.parseEther("6"));

    // Asteapt trecerea a 700 secunde pentru a incheia strangerea de fonduri
    await network.provider.send("evm_increaseTime", [700]); // avansez timpul cu 700 secunde
    await network.provider.send("evm_mine", []); // minez blocul pentru a aplica timpul avansat

    // Owner apeleaza startVoting
    await fundraising.connect(owner).startVoting(["Clean waters", "Help children"], [cause1Address.address, cause2Address.address]);

    console.log("Voting Started for causes");

    console.log(`Cause 1: Clean waters - Address: ${cause1Address.address}`);
    console.log(`Cause 2: Help children - Address: ${cause2Address.address}`);

    // Donatorii vor apela functia approve, allowance din DNT și vote
    await donationToken.connect(addr1).approve(fundraising.target, ethers.parseEther("100"));
    const allowance1 = await donationToken.allowance(addr1.address, fundraising.target);
    console.log(`Allowance for addr1: ${ethers.formatEther(allowance1)}`);

    // Balance inainte de vot
    const balanceBeforeVote = await donationToken.connect(addr1).balanceOf(addr1.address);
    console.log("Balance of first donor before vote: ", ethers.formatEther(balanceBeforeVote));

    // Donatorul voteaza
    await fundraising.connect(addr1).vote("Clean waters");

    // Balance dupa vot
    const balanceAfterVote = await donationToken.connect(addr1).balanceOf(addr1.address);
    console.log("Balance of first donor after vote: ", ethers.formatEther(balanceAfterVote));
    console.log("First donor voted for Clean waters");


    await donationToken.connect(addr2).approve(fundraising.target, ethers.parseEther("100"));
    const allowance2 = await donationToken.allowance(addr2.address, fundraising.target);
    console.log(`Allowance for addr2: ${ethers.formatEther(allowance2)}`);

    // Balance inainte de vot
    const balanceBeforeVote2 = await donationToken.connect(addr2).balanceOf(addr2.address);
    console.log("Balance of second donor before vote: ", ethers.formatEther(balanceBeforeVote2));

    // Donatorul voteaza
    await fundraising.connect(addr2).vote("Clean waters");

    // Balance după vot
    const balanceAfterVote2 = await donationToken.connect(addr2).balanceOf(addr2.address);
    console.log("Balance of second donor after vote: ", ethers.formatEther(balanceAfterVote2));

    console.log("Second donor voted for Clean waters");


    
    await donationToken.connect(addr3).approve(fundraising.target, ethers.parseEther("100"));
    const allowance3 = await donationToken.allowance(addr3.address, fundraising.target);
    console.log(`Allowance for addr3: ${ethers.formatEther(allowance3)}`);
 
    // Balance inainte de vot
    const balanceBeforeVote3 = await donationToken.connect(addr3).balanceOf(addr3.address);
    console.log("Balance of third donor before vote: ", ethers.formatEther(balanceBeforeVote3));
 
    // Donatorul voteaza
    await fundraising.connect(addr3).vote("Help children");
 
    // Balance dupa vot
    const balanceAfterVote3 = await donationToken.connect(addr3).balanceOf(addr3.address);
    console.log("Balance of third donor after vote: ", ethers.formatEther(balanceAfterVote3));
 
    console.log("Third donor voted for Help children");


    // Verific totalul voturilor
    const votesCause1 = await fundraising.votes("Clean waters");
    const votesCause2 = await fundraising.votes("Help children");

    console.log(`Votes for cauza1: ${votesCause1}`);
    console.log(`Votes for cauza2: ${votesCause2}`);


    // Astept trecerea a 700 secunde pentru a incheia strangerea de fonduri
    await network.provider.send("evm_increaseTime", [700]); 
    await network.provider.send("evm_mine", []); 

    console.log("Voting ended for causes. Now the distribution is starting");

    // Verific balanta inainte de a distribui fondurile
    const balanceCause1Before = await ethers.provider.getBalance(cause1Address);
    const balanceCause2Before = await ethers.provider.getBalance(cause2Address);

    console.log("Before distribution:");
    console.log("Cause 1 balance: ", ethers.formatEther(balanceCause1Before), "ETH");
    console.log("Cause 2 balance: ", ethers.formatEther(balanceCause2Before), "ETH");

    // Owner-ul apeleaza functia de distribuire a fondurilor
    await fundraising.connect(owner).distributeFunds();

    console.log("Funds distributed");

    // Verific balanta dupa distribuirea fondurilor
    const balanceCause1After = await ethers.provider.getBalance(cause1Address);
    const balanceCause2After = await ethers.provider.getBalance(cause2Address);

    console.log("After distribution:");
    console.log("Cause 1 balance: ", ethers.formatEther(balanceCause1After), "ETH");
    console.log("Cause 2 balance: ", ethers.formatEther(balanceCause2After), "ETH");

  });
});

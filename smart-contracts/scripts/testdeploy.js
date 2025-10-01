const { ethers } = require("hardhat");

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const nativeCurrency = "0x0000000000000000000000000000000000000000";
const imperUSDC = "0x4B16c5dE96EB2117bBE5fd171E4d203624B014aa";
const _100000 = ethers.parseUnits("100000", 6);
const _1000 = ethers.parseUnits("1000", 6);
const _120 = ethers.parseUnits("120", 6);
const _200 = ethers.parseUnits("200", 6);
const _10000 = ethers.parseUnits("10000", 6);
async function main() {
  const [deployer, per1, per2, per3, per4, manager] = await ethers.getSigners();

  //Impersonation
  const tx = {
    to: imperUSDC,
    value: ethers.parseEther("10"),
  };

  await deployer.sendTransaction(tx);

  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [imperUSDC],
  });

  const signerUSDC = await ethers.getSigner(imperUSDC);

  const usdc = await ethers.getContractAt("USDC", USDC);
  await usdc.connect(signerUSDC).transfer(per2.address, _1000);
  await usdc.connect(signerUSDC).transfer(deployer.address, _1000);
  await usdc.connect(signerUSDC).transfer(per3.address, _1000);
  await usdc.connect(signerUSDC).transfer(per4.address, _1000);
  console.log("Funds Transfered");
  const RWA = await hre.ethers.getContractFactory("RWA");
  const rwa = await RWA.deploy();
  await rwa.waitForDeployment();
  console.log("RWA Deployment Address:", rwa.target);

  const Form = await hre.ethers.getContractFactory("RegistrationForm");
  const form = await Form.deploy(rwa.target);
  await form.waitForDeployment();
  console.log("RegistrationForm Deployment Address:", form.target);

  const Marketplace = await hre.ethers.getContractFactory("MarketPlace");
  const marketplace = await Marketplace.deploy(rwa.target, 260);
  await marketplace.waitForDeployment();
  console.log("Marketplace Deployment Address:", marketplace.target);

  console.log("############################################");
  await rwa.initialize(form.target, marketplace.target);
  console.log("RWA Contract Initialized Successfully");

  const request1 = {
    owner: per1.address,
    pricePerShare: ethers.parseUnits("10", 6),
    totalShares: 100,
    saleTime: 3600,
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo",
  };

  const request2 = {
    owner: per2.address,
    pricePerShare: ethers.parseUnits("15", 6),
    totalShares: 150,
    saleTime: 36000,
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo",
  };

  await form.connect(per1).registerProperty(request1);
  await form.connect(per1).registerProperty(request2);

  console.log("Registered");
  await form.validateForm(1, 20, true);
  await form.validateForm(2, 20, true);

  console.log("Listed", await rwa.totalProperties());

  console.log(
    "Get Quote",
    await marketplace.getQuote(nativeCurrency, 85, request1.pricePerShare)
  );
  console.log("Before ", await marketplace.getPrimarySale(1));
  await marketplace
    .connect(per3)
    .buyPrimaryShares(per3.address, nativeCurrency, 1, 85, {
      value: ethers.parseEther("0.37"),
    });

  await network.provider.request({
    method: "evm_increaseTime",
    params: [4000],
  });

  await network.provider.request({
    method: "evm_mine",
    params: [],
  });
  console.log("Time passed");
  await marketplace.concludePrimarySale(1);
  console.log("Primary Sale Ended");
  await marketplace.connect(per3).claimPendingSharesOrFunds(1);

  console.log("Property Details", await rwa.getPropertyDetails(1));
  console.log(
    "Secondary Listing Before",
    await marketplace.getSecondaryListing(per3.address, 1)
  );
  await rwa.connect(per3).setApprovalForAll(marketplace.target, true);
  await marketplace.connect(per3).secondarySale(1, 50, request1.pricePerShare);
  console.log(
    "Secondary Listing After",
    await marketplace.getSecondaryListing(per3.address, 1)
  );
  console.log("Listed", await rwa.totalProperties());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

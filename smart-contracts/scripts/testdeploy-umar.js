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
    totalShares: 60,
    saleTime: 3600,
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo",
  };
  const request3 = {
    owner: per2.address,
    pricePerShare: ethers.parseUnits("15", 6),
    totalShares: 60,
    saleTime: 3600,
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo",
  };
  await form.connect(per1).registerProperty(request1);
  await form.connect(per1).registerProperty(request2);
  await form.connect(per1).registerProperty(request3);
  console.log("Registered");
  await form.validateForm(1, 50, true);
  await form.validateForm(2, 50, false);
  await form.validateForm(3, 50, true);

  console.log("Listed", await rwa.totalProperties());
  console.log("Before ", await marketplace.getPrimarySale(1));
  const _1stQuote = await marketplace.getQuote(
    nativeCurrency,
    20,
    request1.pricePerShare
  );
  const _2ndQuote = await marketplace.getQuote(
    nativeCurrency,
    45,
    request3.pricePerShare
  );
  console.log("Get Quote 20", _1stQuote);
  console.log("Get Quote 20", _2ndQuote);

  await marketplace
    .connect(per1)
    .buyPrimaryShares(per1.address, nativeCurrency, 1, 20, {
      value: _1stQuote,
    });
  await marketplace
    .connect(per1)
    .buyPrimaryShares(per1.address, nativeCurrency, 1, 20, {
      value: _1stQuote,
    });
  await marketplace
    .connect(per2)
    .buyPrimaryShares(per2.address, nativeCurrency, 1, 20, {
      value: _1stQuote,
    });
  console.log("Bought Quote 20");
  await marketplace
    .connect(per1)
    .buyPrimaryShares(per1.address, nativeCurrency, 2, 45, {
      value: _2ndQuote,
    });
  console.log("Bought Quote 30");

  await network.provider.request({
    method: "evm_increaseTime",
    params: [4000],
  });

  await network.provider.request({
    method: "evm_mine",
    params: [],
  });
  console.log("Time passed");
  // await marketplace.concludePrimarySale(1);
  // await marketplace.concludePrimarySale(2);
  // console.log("Primary Sale Ended");

  // console.log("User Balance per1", await rwa.balanceOf(per1.address,1));
  // console.log("User Balance per1", await rwa.balanceOf(per1.address,2));
  // console.log("User Balance per2", await rwa.balanceOf(per2.address,1));
  // console.log("Property Details", await marketplace.getPendingSharesDetails(per1.address,1));
  // console.log("Property Details", await marketplace.getPendingSharesDetails(per1.address,2));
  // console.log("Property Details", await marketplace.getPendingSharesDetails(per2.address,1));

  // await marketplace.connect(per1).claimPendingSharesOrFunds(1);
  // await marketplace.connect(per2).claimPendingSharesOrFunds(1);

  // console.log("User Balance per1", await rwa.balanceOf(per1.address,1));
  // console.log("User Balance per2", await rwa.balanceOf(per2.address,1));
  // console.log("Property Details", await marketplace.getPendingSharesDetails(per1.address,1));
  // console.log("Property Details", await marketplace.getPendingSharesDetails(per2.address,1));

  // console.log(
  //   "Secondary Listing Before",
  //   await marketplace.getSecondaryListing(per3.address, 1)
  // );
  // await rwa.connect(per3).setApprovalForAll(marketplace.target, true);
  // await marketplace.connect(per3).secondarySale(1, 50, request1.pricePerShare);
  // console.log(
  //   "Secondary Listing After",
  //   await marketplace.getSecondaryListing(per3.address, 1)
  // );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

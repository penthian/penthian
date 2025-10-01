const { ethers } = require("hardhat");
const rwaModule = require("../ignition/modules/rwa");
const formModule = require("../ignition/modules/form");
const marketplaceModule = require("../ignition/modules/market");

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
    pricePerShare: ethers.parseUnits("1", 6),
    totalShares: 100,
    saleTime: 3600,
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo/",
  };
  const request2 = {
    owner: per1.address,
    pricePerShare: ethers.parseUnits("2", 6),
    totalShares: 200,
    saleTime: 3600,
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo/",
  };
  const request3 = {
    owner: per1.address,
    pricePerShare: ethers.parseUnits("3", 6),
    totalShares: 300,
    saleTime: 3600,
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo/",
  };
  await form.registerProperty(request1);
  await form.registerProperty(request2);
  await form.registerProperty(request3);
  console.log("Registered");

  await form.validateForm(1, 5, true);
  await form.validateForm(1, 5, false);
  // await form.validateForm(1, 5, true);
  console.log("All validated");

  // console.log(
  //   "Get Quote",
  //   await marketplace.getQuote(nativeCurrency, 20, request1.pricePerShare)
  // );
  // console.log("Before ", await marketplace.getPrimarySale(1));
  // await marketplace.buyPrimaryShares(per2.address, nativeCurrency, 1, 20, {
  //   value: ethers.parseEther("0.085"),
  // });

  // await usdc.connect(per2).approve(marketplace.target, _100000);
  // await marketplace.connect(per2).buyPrimaryShares(per2.address, USDC, 1, 80);
  // console.log("After ", await marketplace.getPrimarySale(1));
  // console.log("Before ", await marketplace.getPrimarySaleState(1));

  // console.log(
  //   "User Info",
  //   await marketplace.getPendingSharesDetails(per2.address, 1)
  // );

  // await network.provider.request({
  //   method: "evm_increaseTime",
  //   params: [86400],
  // });

  // await network.provider.request({
  //   method: "evm_mine",
  //   params: [],
  // });
  // console.log("Time passed");
  // await marketplace.concludePrimarySale(1);
  // console.log("Primary Sale Ended");

  // console.log("After ", await marketplace.getPrimarySaleState(1));
  // console.log(
  //   "Before Contract",
  //   await usdc.balanceOf(marketplace.target),
  //   await ethers.provider.getBalance(marketplace.target),
  //   await rwa.balanceOf(marketplace.target, 1)
  // );
  // console.log(
  //   "Before User",
  //   await usdc.balanceOf(per2.address),
  //   await ethers.provider.getBalance(per2.address),
  //   await rwa.balanceOf(per2.address, 1)
  // );
  // await marketplace.connect(per2).claimPendingSharesOrFunds(1);
  // console.log(
  //   "After User",
  //   await usdc.balanceOf(per2.address),
  //   await ethers.provider.getBalance(per2.address),
  //   await rwa.balanceOf(per2.address, 1)
  // );
  // console.log(
  //   "After Contract",
  //   await usdc.balanceOf(marketplace.target),
  //   await ethers.provider.getBalance(marketplace.target),
  //   await rwa.balanceOf(marketplace.target, 1)
  // );

  // console.log("Property Details", await rwa.getPropertyDetails(1));
  // console.log(
  //   "Secondary Listing",
  //   await marketplace.getSecondaryListing(per2.address, 1)
  // );
  // await rwa.connect(per2).setApprovalForAll(marketplace.target, true);
  // await marketplace.connect(per2).secondarySale(1, 50, request1.pricePerShare);
  // console.log(
  //   "Secondary Listing",
  //   await marketplace.getSecondaryListing(per2.address, 1)
  // );

  // const purchase = {
  //   seller: per2.address,
  //   propertyId: 1,
  //   sharesToBuy: 10,
  // };

  // console.log(
  //   "Before User",
  //   await usdc.balanceOf(per2.address),
  //   await ethers.provider.getBalance(per2.address),
  //   await ethers.provider.getBalance(deployer.address),
  //   await usdc.balanceOf(deployer.address),
  //   await rwa.balanceOf(per2.address, 1),
  //   await rwa.balanceOf(deployer.address, 1),
  //   await rwa.balanceOf(per3.address, 1)
  // );
  // await usdc.approve(marketplace.target, _100000);

  // await marketplace.buySecondaryShares(purchase, deployer.address, USDC);

  // console.log(
  //   "Get Quote",
  //   await marketplace.getQuote(nativeCurrency, 10, request1.pricePerShare)
  // );
  // await marketplace
  //   .connect(per3)
  //   .buySecondaryShares(purchase, per3.address, nativeCurrency, {
  //     value: ethers.parseEther("0.045"),
  //   });

  // console.log(
  //   "Secondary Listing",
  //   await marketplace.getSecondaryListing(per2.address, 1)
  // );

  // console.log(
  //   "After User",
  //   await usdc.balanceOf(per2.address),
  //   await ethers.provider.getBalance(per2.address),
  //   await ethers.provider.getBalance(deployer.address),
  //   await usdc.balanceOf(deployer.address),
  //   await rwa.balanceOf(per2.address, 1),
  //   await rwa.balanceOf(deployer.address, 1),
  //   await rwa.balanceOf(per3.address, 1)
  // );
  // await marketplace
  //   .connect(per2)
  //   .updateSecondarySale(1, 60, ethers.parseUnits("20", 6));
  // console.log(
  //   "Secondary Listing",
  //   await marketplace.getSecondaryListing(per2.address, 1)
  // );
  // await marketplace.connect(per2).cancelSecondarySale(1);
  // console.log(
  //   "Secondary Listing",
  //   await marketplace.getSecondaryListing(per2.address, 1)
  // );

  // console.log("Property Details", await rwa.getPropertyDetails(1));

  // //////////////////////////////////////Bulk Buy////////////////////////////////////////
  // console.log("Bulk Buying.....");
  // await rwa.setApprovalForAll(marketplace.target, true);
  // await marketplace.secondarySale(1, 10, request1.pricePerShare);

  // console.log(
  //   "Secondary Listing of deployer",
  //   await marketplace.getSecondaryListing(deployer.address, 1)
  // );

  // await rwa.connect(per3).setApprovalForAll(marketplace.target, true);
  // await marketplace.connect(per3).secondarySale(1, 10, request1.pricePerShare);

  // console.log(
  //   "Secondary Listing of per3",
  //   await marketplace.getSecondaryListing(per3.address, 1)
  // );

  // const bulkPurchase1 = {
  //   seller: deployer.address,
  //   propertyId: 1,
  //   sharesToBuy: 10,
  // };

  // const bulkPurchase2 = {
  //   seller: per3.address,
  //   propertyId: 1,
  //   sharesToBuy: 10,
  // };

  // console.log(
  //   "per4 Before",
  //   await rwa.balanceOf(per4.address, 1),
  //   await usdc.balanceOf(deployer.address),
  //   await usdc.balanceOf(per3.address),
  //   await usdc.balanceOf(per4.address)
  // );
  // console.log("Property Details Before", await rwa.getPropertyDetails(1));
  // await usdc.connect(per4).approve(marketplace.target, _100000);
  // await marketplace
  //   .connect(per4)
  //   .bulkBuySecondarySale([bulkPurchase1, bulkPurchase2], per4.address);
  // console.log(
  //   "Secondary Listing of deployer After",
  //   await marketplace.getSecondaryListing(deployer.address, 1)
  // );
  // console.log(
  //   "Secondary Listing of per3 After",
  //   await marketplace.getSecondaryListing(per3.address, 1)
  // );
  // console.log(
  //   "per4 After",
  //   await rwa.balanceOf(per4.address, 1),
  //   await usdc.balanceOf(deployer.address),
  //   await usdc.balanceOf(per3.address),
  //   await usdc.balanceOf(per4.address)
  // );
  // console.log("Property Details After", await rwa.getPropertyDetails(1));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

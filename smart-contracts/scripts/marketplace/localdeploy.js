const { ethers } = require("hardhat");
const {
  forwardTime,
  generateFundedWallets,
  logTokenBalance,
  logRwaBalance,
} = require("../verify");

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const nativeCurrency = "0x0000000000000000000000000000000000000000";
const imperUSDC = "0x01b8697695EAb322A339c4bf75740Db75dc9375E";
const _100 = ethers.parseUnits("100", 6);
const _200 = ethers.parseUnits("200", 6);
const _1000 = ethers.parseUnits("1000", 6);
const _10000 = ethers.parseUnits("10000", 6);
const _100000 = ethers.parseUnits("100000", 6);
const _1000000 = ethers.parseUnits("1000000", 6);

async function main() {
  let forwardedTime = 0;
  const [hardhatWallet] = await ethers.getSigners();
  const randomWallets = await generateFundedWallets(hardhatWallet);

  randomWallets.forEach((wall, ind) => {
    console.log(`Wallet ${ind + 1} : ${wall.address}`);
  });

  const [deployer, per1, per2, per3, per4, per5, per6, per7] = randomWallets;

  const DEPLOYER_ADDRESS = deployer.address;
  const PER1_ADDRESS = per1.address;
  const PER2_ADDRESS = per2.address;
  const PER3_ADDRESS = per3.address;
  const PER4_ADDRESS = per4.address;
  const PER5_ADDRESS = per5.address;
  const PER6_ADDRESS = per6.address;
  const PER7_ADDRESS = per7.address;

  // Impersonation
  const tx = {
    to: imperUSDC,
    value: ethers.parseEther("10"),
  };

  await hardhatWallet.sendTransaction(tx);
  console.log("ETH transfered Successfully");
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [imperUSDC],
  });

  const signerUSDC = await ethers.getSigner(imperUSDC);

  const usdc = await ethers.getContractAt("USDC_TEST", USDC);
  await usdc.connect(signerUSDC).transfer(deployer.address, _1000);
  await usdc.connect(signerUSDC).transfer(PER1_ADDRESS, _1000);
  await usdc.connect(signerUSDC).transfer(PER2_ADDRESS, _1000);
  await usdc.connect(signerUSDC).transfer(PER3_ADDRESS, _1000);
  await usdc.connect(signerUSDC).transfer(PER4_ADDRESS, _1000);
  await usdc.connect(signerUSDC).transfer(PER5_ADDRESS, _1000);
  await usdc.connect(signerUSDC).transfer(PER6_ADDRESS, _1000);
  await usdc.connect(signerUSDC).transfer(PER7_ADDRESS, _1000);

  console.log("Funds Transferred");

  const RWA = await hre.ethers.getContractFactory("RWA");
  const rwa = await RWA.connect(deployer).deploy();
  await rwa.waitForDeployment();
  console.log("RWA Deployment Address:", rwa.target);

  const platformFeeBips_ = "100"; //10000 for 100% ==> 100 for 1%
  const minListingPriceBips_ = "9000"; //10000 for 100% ==> 9000 for 90%
  const minBidIncrementBips_ = "500"; //10000 for 100% ==> 500 for 5%
  const referralBips_ = "1000"; //10000 for 100% ==> 500 for 5%

  const MarketPlace = await hre.ethers.getContractFactory("MarketPlace");
  const marketplace = await MarketPlace.connect(deployer).deploy(
    rwa.target,
    platformFeeBips_,
    minListingPriceBips_,
    minBidIncrementBips_,
    referralBips_
  );

  await marketplace.waitForDeployment();
  console.log("Marketplace Deployment Address:", marketplace.target);

  const Form = await hre.ethers.getContractFactory("RegistrationForm");
  const form = await Form.connect(deployer).deploy(
    rwa.target,
    marketplace.target,
    _100
  );
  await form.waitForDeployment();
  console.log("RegistrationForm Deployment Address:", form.target);

  const Rent = await hre.ethers.getContractFactory("Rent");
  const rent = await Rent.connect(deployer).deploy(
    rwa.target,
    marketplace.target
  );
  await rent.waitForDeployment();
  console.log("Rent Deployment Address:", rent.target);

  const _feesInUsdc = ethers.parseUnits("1", 6);
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.connect(deployer).deploy(
    rwa.target,
    marketplace.target,
    _feesInUsdc
  );
  await voting.waitForDeployment();
  console.log("Voting Deployment Address:", voting.target);

  console.log(
    "======================== DEPLOYMENT DONE ========================"
  );

  await rwa.connect(deployer).initialize(form.target, marketplace.target);
  console.log("RWA Contract Initialized Successfully");

  console.log("======================== INIT DONE ========================");

  const isFormPaused = await form.getIsPaused();
  const registrationFeesWei = (await form.getRegistrationFees()).toString();
  const registrationFees = ethers.formatUnits(registrationFeesWei, 6);

  const request1 = {
    owner: PER1_ADDRESS,
    pricePerShare: ethers.parseUnits("1", 6),
    totalShares: 100,
    saleTime: 3600,
    aprBips: 100, //1000 for 100% then 100 ==> 10%
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo",
  };

  const request2 = {
    owner: PER1_ADDRESS,
    pricePerShare: ethers.parseUnits("2", 6),
    totalShares: 200,
    saleTime: 3600,
    aprBips: 100, //1000 for 100% then 100 ==> 10%
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo",
  };

  const request3 = {
    owner: PER1_ADDRESS,
    pricePerShare: ethers.parseUnits("3", 6),
    totalShares: 300,
    saleTime: 3600,
    aprBips: 100, //1000 for 100% then 100 ==> 10%
    uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo",
  };

  console.log("🚀 ~ main ~ isFormPaused:", isFormPaused);
  console.log("🚀 ~ main ~ registrationFees:", registrationFees);

  await usdc.connect(per1).approve(form.target, _1000);
  console.log("APPROVED USDC FOR REGISTRATION");
  await form.connect(per1).registerProperty(request1);
  console.log("REGISTRATION 1 DONE");
  await form.connect(per1).registerProperty(request2);
  console.log("REGISTRATION 2 DONE");
  await form.connect(per1).registerProperty(request3);
  console.log("REGISTRATION 3 DONE");

  console.log(
    "======================== REGISTRATION DONE ========================"
  );

  console.log("validated started");
  await form.connect(deployer).validateForms(1, 90, true);
  console.log("validated 1");
  await form.connect(deployer).validateForms(2, 90, true);
  console.log("validated 2");
  await form.connect(deployer).validateForms(3, 90, true);
  console.log("validated 3");

  console.log(
    "======================== VALIDATION DONE ========================"
  );
  console.log("Primary Listed", await rwa.totalProperties());

  console.log("Before Listing 1", await marketplace.getPrimarySale(1));
  console.log("Before Listing 2", await marketplace.getPrimarySale(2));
  console.log("Before Listing 3", await marketplace.getPrimarySale(3));

  const _1stQuote = await marketplace.getQuote(
    nativeCurrency,
    100,
    request1.pricePerShare
  );
  const _2ndQuote = await marketplace.getQuote(
    nativeCurrency,
    200,
    request2.pricePerShare
  );
  const _3rdQuote = await marketplace.getQuote(
    nativeCurrency,
    300,
    request3.pricePerShare
  );
  console.log("Get Quote 100", _1stQuote);
  console.log("Get Quote 200", _2ndQuote);
  console.log("Get Quote 300", _3rdQuote);

  console.log(
    "======================== BNB QUOTES DONE ========================"
  );

  await marketplace
    .connect(deployer)
    .updateAgentWhitelistStatus(PER4_ADDRESS, true);
  await marketplace
    .connect(deployer)
    .updateAgentWhitelistStatus(PER5_ADDRESS, true);

  await usdc.connect(per1).approve(marketplace.target, _1000);

  await marketplace
    .connect(per1)
    .buyPrimaryShares(PER1_ADDRESS, usdc.target, 1, 100, PER4_ADDRESS);
  console.log("per1 bought shares of property 1 with usdc");
  await marketplace
    .connect(per2)
    .buyPrimaryShares(PER2_ADDRESS, nativeCurrency, 2, 200, PER5_ADDRESS, {
      value: _2ndQuote,
    });
  console.log("per2 bought shares of property 2 with BNB native currency");

  await marketplace
    .connect(per3)
    .buyPrimaryShares(PER3_ADDRESS, nativeCurrency, 3, 300, nativeCurrency, {
      value: _3rdQuote,
    });
  console.log("per3 bought shares of property 3 with BNB native currency");

  console.log(
    "======================== BOUGHT SHARES DONE ========================"
  );

  console.log("After Listing 1", await marketplace.getPrimarySale(1));
  console.log("After Listing 2", await marketplace.getPrimarySale(2));
  console.log("After Listing 3", await marketplace.getPrimarySale(3));

  await forwardTime(4000);
  forwardedTime = forwardedTime + 4000;

  console.log(
    "per 4 commission Before",
    await marketplace.getReferralCommission(PER4_ADDRESS, 1)
  );
  console.log(
    "per 5 commission Before",
    await marketplace.getReferralCommission(PER5_ADDRESS, 2)
  );

  await marketplace.connect(deployer).concludePrimarySale(1);
  console.log("concluded primary sale 1");
  try {
    await marketplace.connect(deployer).concludePrimarySale(1); //NO effects
    console.log("concluded primary sale 1 again");
  } catch (error) {
    console.log(
      "Expected Error concluding primary sale 1 again:",
      error.message
    );
  }
  await marketplace.connect(deployer).concludePrimarySale(2);
  console.log("concluded primary sale 2");
  await marketplace.connect(deployer).concludePrimarySale(3);
  console.log("concluded primary sale 3");

  console.log(
    "======================== CONCLUSION DONE ========================"
  );

  await marketplace.connect(per1).claimPendingSharesOrFunds(1);
  await marketplace.connect(per2).claimPendingSharesOrFunds(2);
  await marketplace.connect(per3).claimPendingSharesOrFunds(3);
  console.log("properties claimed");

  console.log("======================== AGENTS CLAIMING COMMISSIONS ========================");

  await marketplace.connect(per4).claimReferralCommission(1);
  await marketplace.connect(per5).claimReferralCommission(2);

  console.log("======================== COMMISSION CLAIMED ========================");

  console.log(
    "per 4 commission After",
    await marketplace.getReferralCommission(PER4_ADDRESS, 1)
  );
  console.log(
    "per 5 commission After",
    await marketplace.getReferralCommission(PER5_ADDRESS, 2)
  );

  console.log("======================== CLAIM DONE ========================");

  await logRwaBalance(rwa, 1, PER1_ADDRESS, "PER1_ADDRESS");
  await logRwaBalance(rwa, 2, PER2_ADDRESS, "PER2_ADDRESS");
  await logRwaBalance(rwa, 3, PER3_ADDRESS, "PER3_ADDRESS");

  await logRwaBalance(rwa, 1, DEPLOYER_ADDRESS, "DEPLOYER_ADDRESS");
  await logRwaBalance(rwa, 2, DEPLOYER_ADDRESS, "DEPLOYER_ADDRESS");
  await logRwaBalance(rwa, 3, DEPLOYER_ADDRESS, "DEPLOYER_ADDRESS");

  console.log(
    "================================================================"
  );
  console.log(
    "======================== AUCTION STARTS ========================"
  );
  console.log(
    "================================================================"
  );

  const BASE = 10000;

  // Get current timestamp
  const now = Number(await marketplace.clock()); // current time in seconds

  const _propertyId = 1;
  const _noOfShares = 10;
  const _basePrice = ethers.parseUnits("10", 6);
  const _startTime = now + 60; // now
  const _endTime = _startTime + 1200; // 20 minutes after _startTime

  console.log("🚀 ~ main ~ now:", now);
  // console.log("🚀 ~ main ~ _startTime:", _startTime)
  // console.log("🚀 ~ main ~ _endTime:", _endTime)

  await rwa.connect(per1).setApprovalForAll(marketplace.target, true);
  await marketplace
    .connect(per1)
    .createAuction(_propertyId, _noOfShares, _basePrice, _startTime, _endTime);
  const auction_id_1 = "1";

  // await marketplace
  //   .connect(per1)
  //   .cancelAuction(auction_id_1);

  console.log(
    "======================== AUCTION 1 CREATION DONE ========================"
  );

  console.log(
    "Auction Details Before:",
    await marketplace.getAuctionDetails(auction_id_1)
  );

  await forwardTime(300); //5 minutes
  forwardedTime = forwardedTime + 300;

  const _1stBid = await marketplace.getAuctionDetails(auction_id_1);
  const bid_1_amount = _1stBid.basePrice;
  const _1stBid_highestBid = _1stBid.highestBid;
  console.log("🚀 ~ main ~ _1stBid_highestBid:", _1stBid_highestBid);
  console.log("🚀 ~ main ~ bid_1_amount:", bid_1_amount);

  await usdc.connect(per5).approve(marketplace.target, bid_1_amount);
  await marketplace.connect(per5).placeBid(auction_id_1, bid_1_amount);

  console.log("================= FIRST BID DONE =================");

  const after1stBid = await marketplace.getAuctionDetails(auction_id_1);
  const minBidIncrementBips = Number(
    await marketplace.getMinBidIncrementBips()
  );
  const after1stBid_highestBid = parseFloat(
    ethers.formatUnits(after1stBid.highestBid, 6)
  );

  const bid_2_amount =
    after1stBid_highestBid +
    (after1stBid_highestBid * minBidIncrementBips) / BASE;
  const bid_2_amount_wei = ethers.parseUnits(String(bid_2_amount), 6);

  console.log("🚀 ~ main ~ after1stBid_highestBid:", after1stBid_highestBid);
  console.log("🚀 ~ main ~ bid_2_amount:", bid_2_amount);
  console.log("🚀 ~ main ~ bid_2_amount_wei:", bid_2_amount_wei);

  await usdc.connect(per6).approve(marketplace.target, bid_2_amount_wei);
  await marketplace.connect(per6).placeBid(auction_id_1, bid_2_amount_wei);
  console.log("================= SECOND BID DONE =================");

  const after2ndBid = await marketplace.getAuctionDetails(auction_id_1);
  const after2ndBid_highestBid = parseFloat(
    ethers.formatUnits(after2ndBid.highestBid, 6)
  );
  const bid_3_amount =
    after2ndBid_highestBid +
    (after2ndBid_highestBid * minBidIncrementBips) / BASE;
  const bid_3_amount_wei = ethers.parseUnits(String(bid_3_amount), 6);

  console.log("🚀 ~ main ~ after2ndBid_highestBid:", after2ndBid_highestBid);
  console.log("🚀 ~ main ~ bid_3_amount:", bid_3_amount);
  console.log("🚀 ~ main ~ bid_3_amount_wei:", bid_3_amount_wei);

  await usdc.connect(per6).approve(marketplace.target, bid_3_amount_wei);
  await marketplace.connect(per6).placeBid(auction_id_1, bid_3_amount_wei);

  console.log("================= THIRD BID DONE =================");
  console.log(
    "Auction Details After Bid 3rd:",
    await marketplace.getAuctionDetails(auction_id_1)
  );

  await forwardTime(60 * 20); //20 minutes
  forwardedTime = forwardedTime + 60 * 20;

  await logTokenBalance(usdc, DEPLOYER_ADDRESS, "DEPLOYER_ADDRESS");
  await logTokenBalance(usdc, PER1_ADDRESS, "PER1_ADDRESS");
  await logTokenBalance(usdc, PER6_ADDRESS, "PER6_ADDRESS");

  await logRwaBalance(rwa, 1, PER1_ADDRESS, "PER1_ADDRESS");
  await logRwaBalance(rwa, 1, PER6_ADDRESS, "PER6_ADDRESS");

  await marketplace.concludeAuction(auction_id_1); //ca be concluded by anyone
  console.log("============= AUCTION CONCLUDED =============");

  // console.log(
  //   "Auction Details After Conclusion:",
  //   await marketplace.getAuctionDetails(auction_id_1)
  // );

  await logTokenBalance(usdc, DEPLOYER_ADDRESS, "DEPLOYER_ADDRESS");
  await logTokenBalance(usdc, PER1_ADDRESS, "PER1_ADDRESS");
  await logTokenBalance(usdc, PER6_ADDRESS, "PER6_ADDRESS");

  await logRwaBalance(rwa, 1, PER1_ADDRESS, "PER1_ADDRESS");
  await logRwaBalance(rwa, 1, PER6_ADDRESS, "PER6_ADDRESS");

  console.log(
    "======================== AUCTION 1 WORKING DONE ========================"
  );

  console.log("======================== RENT STARTS ========================");

  const RENTING_PROPERTY = "1";
  const _totalMonthRent = ethers.parseUnits("100", 6);

  await usdc.connect(deployer).approve(rent.target, _totalMonthRent);
  console.log("=========== RENT APPROVED ===========");
  await rent.connect(deployer).addRent(RENTING_PROPERTY, _totalMonthRent);
  console.log("=========== RENT ADDED ===========");

  const rent_details_2 = await rent.getRentDetails(RENTING_PROPERTY);
  console.log("🚀 ~ main ~ rent_details_2:", rent_details_2);

  await logRwaBalance(rwa, RENTING_PROPERTY, PER1_ADDRESS, "PER1_ADDRESS");
  await logRwaBalance(rwa, RENTING_PROPERTY, PER2_ADDRESS, "PER2_ADDRESS");
  await logRwaBalance(rwa, RENTING_PROPERTY, PER6_ADDRESS, "PER6_ADDRESS");

  const per1Eligible = await rent.isEligibleForRent(
    RENTING_PROPERTY,
    PER1_ADDRESS
  );
  const per2Eligible = await rent.isEligibleForRent(
    RENTING_PROPERTY,
    PER2_ADDRESS
  );
  const per6Eligible = await rent.isEligibleForRent(
    RENTING_PROPERTY,
    PER6_ADDRESS
  );
  console.log("🚀 ~ PER1_ADDRESS ~ isEligibleForRent:", per1Eligible);
  console.log("🚀 ~ PER2_ADDRESS ~ isEligibleForRent:", per2Eligible);
  console.log("🚀 ~ PER6_ADDRESS ~ isEligibleForRent:", per6Eligible);

  if (per1Eligible) {
    await rent.connect(per1).withdrawRent(RENTING_PROPERTY);
    try {
      await rent.connect(per1).withdrawRent(RENTING_PROPERTY);
    } catch (error) {
      const errorMessage = error.reason || error.message;
      console.log("Can't widthdraw again ", errorMessage);
    }
  }
  if (per2Eligible) {
    await rent.connect(per2).withdrawRent(RENTING_PROPERTY);
  }
  if (per6Eligible) {
    await rent.connect(per6).withdrawRent(RENTING_PROPERTY);
  }
  console.log("=========== RENT WITHDRAWN ===========");

  await forwardTime(31 * 86400); //31 days
  forwardedTime = forwardedTime + 31 * 86400;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

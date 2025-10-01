const { ethers } = require("hardhat");
const {
  verifyContract,
  delay,
} = require("../verify");

async function main() {
  const RWA = await ethers.getContractFactory("RWA");
  const rwa = await RWA.deploy();
  await rwa.waitForDeployment();
  console.log("RWA Deployment Address:", rwa.target);

  const rwaAddress_ = rwa.target;
  const platformFeeBips_ = "100"; //10000 for 100% ==> 100 for 1%
  const minListingPriceBips_ = "9000"; //10000 for 100% ==> 9000 for 90%
  const minBidIncrementBips_ = "500"; //10000 for 100% ==> 500 for 5%
  const referralBips_ = "1000"; //10000 for 100% ==> 1000 for 10%
  const MarketPlace = await hre.ethers.getContractFactory("MarketPlace");
  const marketplace = await MarketPlace.deploy(
    rwaAddress_,
    platformFeeBips_,
    minListingPriceBips_,
    minBidIncrementBips_,
    referralBips_
  );
  await marketplace.waitForDeployment();
  console.log("Marketplace Deployment Address:", marketplace.target);
  const marketplaceAddress_ = marketplace.target



  const registrationFees = ethers.parseUnits("10", 6);
  const Form = await hre.ethers.getContractFactory("RegistrationForm");
  const form = await Form.deploy(
    rwa.target,
    marketplace.target,
    registrationFees
  );
  await form.waitForDeployment();
  console.log("RegistrationForm Deployment Address:", form.target);

  const Rent = await hre.ethers.getContractFactory("Rent");
  const rent = await Rent.deploy(rwa.target, marketplace.target);
  await rent.waitForDeployment();
  console.log("Rent Deployment Address:", rent.target);


  const _feesInUsdc = ethers.parseUnits("1", 6);
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(
    rwaAddress_,
    marketplaceAddress_,
    _feesInUsdc
  );
  await voting.waitForDeployment();
  console.log("Voting Deployment Address:", voting.target);

  console.log(
    "======================== DEPLOYMENT DONE ========================"
  );

  await rwa.initialize(form.target, marketplace.target);
  console.log("RWA Contract Initialized Successfully");

  console.log("======================== INIT DONE ========================");

  const waitSeconds = 60; // 60 seconds
  console.log(`⏳ Waiting ${waitSeconds} seconds before verification...`);
  await delay(waitSeconds);

  const rwaArgs = [];
  await verifyContract(rwa.target, rwaArgs);

  const marketplaceArgs = [
    rwaAddress_,
    platformFeeBips_,
    minListingPriceBips_,
    minBidIncrementBips_,
    referralBips_,
  ];
  await verifyContract(marketplace.target, marketplaceArgs);

  const formArgs = [rwa.target, marketplace.target, registrationFees];
  await verifyContract(form.target, formArgs);

  const rentArgs = [rwa.target, marketplace.target];
  await verifyContract(rent.target, rentArgs);

  const votingArgs = [rwaAddress_, marketplaceAddress_, _feesInUsdc];
  await verifyContract(voting.target, votingArgs);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

//https://etherscan.io/address/0x66cc6c0765e197ebf7795927615983c5cae41c00#code   rwa
//https://etherscan.io/address/0x929ef3B85db9b0c2cd2e22c9A3aeeF956fE16b2A#code   marketplace
//https://etherscan.io/address/0xBD18D356293Ab4772fA8dEf734726111049F2Bf2#code   registration form
//https://etherscan.io/address/0x6E48a0A26dAA9EFB3DEC25b91c1c704ac0569a28#code   rent
//https://etherscan.io/address/0xc30432118807C7AF7B09bfA43E5AFbA1ec3Ea3A2#code   voting

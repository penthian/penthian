const { verify } = require("./verify");

async function main() {
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

  //=================== VERIFY CONTRACTS =================
  await verify(rwa.target, []);
  await verify(form.target, [rwa.target]);
  await verify(marketplace.target, [rwa.target, 260]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });


const { ethers } = require("hardhat");

const rwaAddress = "0xf4BFA2a806898346410bb22CabE133A5e6f5BA8D"
const marketplaceAddress = "0x27C4d57cc9e8535bf9609EE6E1f9AB9d8c3E7A3e"
const usdcAddres = "0x49C614102F28Aa91d0Fc8A05fDa22c15873De2bD"
const _feesInUsdc = ethers.parseEther("1");

async function main() {
    const rwa = await hre.ethers.getContractAt("RWA", rwaAddress);
    const usdc = await hre.ethers.getContractAt("RWA", usdcAddres);
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.connect(deployer).deploy(
        rwaAddress,
        marketplaceAddress,
        _feesInUsdc
    );
    await voting.waitForDeployment();
    console.log("Voting Deployment Address:", voting.target);


    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });

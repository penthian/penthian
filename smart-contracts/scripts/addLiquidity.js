const { ethers } = require("hardhat");

//Sepolia Network
// const factory = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6";
// const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const usdcAddress = "0x49C614102F28Aa91d0Fc8A05fDa22c15873De2bD";

const _1Mether = ethers.parseEther("1000000");
const _ether = ethers.parseEther("0.1");

async function main() {
  const [deployer] = await ethers.getSigners();
  const usdc = await ethers.getContractAt("USDC_TEST", usdcAddress);
  const router = await ethers.getContractAt("Router", routerAddress);

  await usdc.approve(routerAddress, _1Mether);

  console.log("usdc balance before", await usdc.balanceOf(deployer.address));

  await router.addLiquidityETH(
    usdcAddress,
    _1Mether,
    0,
    0,
    deployer.getAddress(),
    Math.floor(Date.now() / 1000) + 60 * 10,
    {
      value: _ether,
    }
  );
  console.log("Liquidity Added Successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

//

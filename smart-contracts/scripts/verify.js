const { run } = require("hardhat");
const { ethers } = require("hardhat");

const WALLETS = [
  {
    privateKey:
      "0x8ae18ca3f3cf776bebd1eb40b8df583361f2572b97b039654e4a561dcd06657f",
    publicKey: "0xE5695FFE5140e61324d6E80cE908EFA444CE2cCF",
  },
  {
    privateKey:
      "0x5f352f35de886f72798efc393c20193bdadd462eef040f7cf48663cfcf3f1b7a",
    publicKey: "0x09f8eb4A13A4ad2cB6C5194CC5992164Fa19BE3F",
  },
  {
    privateKey:
      "0x2f0af514a3e429566e2942f00ae9d8a16138321719b2827a54b48556b0a37bcc",
    publicKey: "0x0a3Ec72E99E30F4df6C320A70E496E68B939a215",
  },
  {
    privateKey:
      "0xef407c267e07294f5378a7c8b9ccbfb2d2e56d381336d9d826d0363f66f6e7bb",
    publicKey: "0xd855729478b821E583ad7306CD6636Bee02434Da",
  },
  {
    privateKey:
      "0xb1856e12b8f99d25d726f20a7ca3f0202e26ff10d1b37a7d32d870df43292606",
    publicKey: "0x0dfBCbe514ee24D83B2a82a3Cf7Ff0C24eFbd0A0",
  },
  {
    privateKey:
      "0x761b384cbe3aa912ec76b959f054f072faede2ca5b9454b98e4a599f22217f8b",
    publicKey: "0x6D0aF1C9219aAB9F4D685e3C4BF20D068B002372",
  },
  {
    privateKey:
      "0xec069ca43d3e4e75b4f24bbdbe35fef6f03596a8f072122a5fa90ee4f84af1e0",
    publicKey: "0x488078EbD6972b0cA39b7E6d90a0CE62cb6fec28",
  },
  {
    privateKey:
      "0xb0d114b15024023dfa42c55e9383235edb9f2ec81758bb65fdfbe049c7fc82f0",
    publicKey: "0x93b77F2D520DFec331dEd75abA52e092C57bEfdC",
  },
  {
    privateKey:
      "0x27017df5e6911b6be9db067dc2115abadc18b754c9b1371be5500fb4bbda2fba",
    publicKey: "0xAadfdA1AD9a7034f6Ada0Dc49FA59fd8Ab9a4582",
  },
  {
    privateKey:
      "0x8f94b3707b5dc642a3b630a434793e7214c119237f3bedcb8541e43322a1b537",
    publicKey: "0xB1F361c8519FA267C7a5A515196A434Dd11586A3",
  },
];

const delay = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

const verifyContract = async (contractAddress, args) => {
  console.log("🚀 ~ verifyContract ~ contractAddress, args:", contractAddress, args)
  try {


    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (err) {
    if (err.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(err);
    }
  }
};

const forwardTime = async (seconds) => {
  await network.provider.request({
    method: "evm_increaseTime",
    params: [seconds],
  });

  await network.provider.request({
    method: "evm_mine",
    params: [],
  });
  console.log("Time Forwarded by ", seconds, " seconds");
};

async function generateFundedWallets(fundingWallet) {
  const provider = fundingWallet.provider;
  const fundedWallets = [];

  for (let i = 0; i < WALLETS.length; i++) {
    const { privateKey } = WALLETS[i];

    // Create wallet from private key and connect to provider
    const wallet = new ethers.Wallet(privateKey, provider);

    // Send funds from funding wallet to this wallet
    const tx = await fundingWallet.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther("10"),
    });

    await tx.wait();

    fundedWallets.push(wallet);
  }

  return fundedWallets;
}

function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
async function logTokenBalance(tokenContract, address, label) {
  const symbol = await tokenContract.symbol();
  const balance = await tokenContract.balanceOf(address);
  const formatted = ethers.formatUnits(balance, await tokenContract.decimals());
  console.log(
    `${label} (${shortenAddress(address)}) ${symbol} balance: ${formatted}`
  );
}
async function logRwaBalance(rwaContract, propertyId, address, label) {
  const symbol = await rwaContract.symbol();
  const balance = await rwaContract.balanceOf(address, propertyId);
  console.log(
    `${label} (${shortenAddress(
      address
    )}) ${symbol} property ${propertyId} balance: ${balance}`
  );
}
module.exports = {
  delay,
  verifyContract,
  forwardTime,
  generateFundedWallets,
  logTokenBalance,
  logRwaBalance,
};
//npx hardhat run scripts/marketplace/localdeploy.js
//npx hardhat run scripts/marketplace/localdeploy.js --network localhost

//npx hardhat verify --network sepolia 0xaCFd80d72f166D9f49a45708dd8BbBb85d956Ba1
//npx hardhat verify --network sepolia 0x29b2f8d17107B134f94d75D25909a2b1b7d06326 0xaCFd80d72f166D9f49a45708dd8BbBb85d956Ba1
//npx hardhat verify --network sepolia 0x5D1e4c0E12F6d289537740Fc2e7043df4D7542Ad 0xaCFd80d72f166D9f49a45708dd8BbBb85d956Ba1 100 9000 500
//npx hardhat verify --network sepolia 0x0675D7f6434aFDD724507e41f9f0bb5C39Ce166B 0xf4BFA2a806898346410bb22CabE133A5e6f5BA8D 0x27C4d57cc9e8535bf9609EE6E1f9AB9d8c3E7A3e 1000000000000000000

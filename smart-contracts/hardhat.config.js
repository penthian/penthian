require("dotenv").config({ path: __dirname + "/.env" });
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      // {
      //   version: "0.7.6",
      //   settings: {
      //     optimizer: {
      //       enabled: true,
      //       runs: 200,
      //     },
      //   },
      // },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      gasPrice: 225000000000,
      forking: {
        // url: "https://blue-icy-fire.bsc.quiknode.pro/14b933c06a477374aa6997c4f29e3ec59a3df4ef/",
        // url: "https://wiser-wider-valley.bsc.discover.quiknode.pro/050ea5d25ccade9d764fac15bd4709b810d543a1/"    //Avalanch mainnet C-chain
        url: "https://eth-mainnet.g.alchemy.com/v2/hmgNbqVFAngktTuwmAB2KceU06IJx-Fh", //eth
        //  url: 'https://arb-mainnet.g.alchemy.com/v2/ffcQWjI00R3YSRuqQXZTCtm_BtxqFE8t', //arbitrum
        // url: `https://bsc-dataseed1.binance.org/`, //bsc testnet
        // url: "https://eth-sepolia.g.alchemy.com/v2/-VVP2mqehOvdG-zqsAs8xCZwWrIP63ho", //sepolia
        // url: "https://eth-sepolia.g.alchemy.com/v2/2aUvl36AwoIdzsS64jsHiO9QE5t8Ftyh", //sepolia
        // url: "https://binance.llamarpc.com",
        // url: "https://yolo-polished-sound.bsc.quiknode.pro/dc7107a3324e26e53b0c0f8fc4594b535df0b87f/", //bsc

        // url: "https://eth-sepolia.g.alchemy.com/v2/CNLkMN9pdZbC0PITTmpCpa0Th4jqEhDQ", //sepolia munity
      },
    },
    ethereum: {
      url: "https://eth-mainnet.g.alchemy.com/v2/hmgNbqVFAngktTuwmAB2KceU06IJx-Fh",
      accounts: [`${process.env.DEPLOYER_PRIVATE_KEY}`],
      chainId: 1,
      gasPrice: 21000000000,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/CNLkMN9pdZbC0PITTmpCpa0Th4jqEhDQ`,
      accounts: [`${process.env.DEPLOYER_PRIVATE_KEY}`],
    },
    tbsc: {
      url: `https://methodical-divine-owl.bsc-testnet.quiknode.pro/be4fbb4ffc33dad16009214e1abe57460875cd9d/`,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      chainId: 97,
      gasPrice: 21000000000,
    },
  },
  etherscan: {
    apiKey: "8Q1DASAX71HBBKK423BRYAN7F1N5KC3JYB", //ETH
  },
};

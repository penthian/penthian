import { mainnet, localhost, sepolia } from "wagmi/chains";
import notFoundImage from "../../public/assets/image-not-found.png";
import penthianLogo from "../../public/assets/logo.svg";
import bitStakeLogo from "../../public/assets/BitStake__black.png";
import { defineChain } from "viem";
import { ConfigType, WertConfigType } from "@/types/config.types";
import {
  formABI,
  marketABI,
  rentABI,
  rwaABI,
  uniswapV2RouterABI,
  usdcABI,
  votingABI,
} from "./ABIs";

export type EnvType = "main" | "test" | "local";

export const ENVIRONMENT: EnvType = "main"; // Change this to "main" for mainnet, "test" for testnet, and "local" for local development

const CONFIG_MAP: Record<EnvType, ConfigType> = {
  main: {
    uniswapV2Weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    uniswapV2Router: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    uniswapV2RouterABI: uniswapV2RouterABI,
    voting: "0xc30432118807c7af7b09bfa43e5afba1ec3ea3a2",
    votingABI: votingABI,
    market: "0x929ef3b85db9b0c2cd2e22c9a3aeef956fe16b2a",
    marketABI: marketABI,
    rent: "0x6e48a0a26daa9efb3dec25b91c1c704ac0569a28",
    rentABI: rentABI,
    form: "0xbd18d356293ab4772fa8def734726111049f2bf2",
    formABI: formABI,
    rwa: "0x66cc6c0765e197ebf7795927615983c5cae41c00",
    rwaABI: rwaABI,
    usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    usdcABI: usdcABI,
    supportedChain: mainnet ,
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/_8ZpKCWtD7f-jc02AcGUf",
    explorerBaseUrl: "https://etherscan.io",
    subgraphUrls: {
      market_url:
        "https://api.studio.thegraph.com/query/112121/penthian-eth-market/v0.0.1", //published
      form_url:
        "https://api.studio.thegraph.com/query/112121/penthian-eth-form/v0.0.2", //published
      rent_url:
        "https://api.studio.thegraph.com/query/112121/penthian-eth-rent/v0.0.1", //published
      voting_url:
        "https://api.studio.thegraph.com/query/112121/penthian-eth-vote/v0.0.1", //published
      rwa_url:
        "https://api.studio.thegraph.com/query/112121/penthian-eth-rwa/v0.0.1", //published
    },
    rentDuration: 86400 * 30, // 30 days in seconds
    votingDuration: 86400 * 30, // 30 days in seconds
    usdcDecimals: 6, // 30 days in seconds
  },
  test: {
    uniswapV2Weth: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
    uniswapV2Router: "0xee567fe1712faf6149d80da1e6934e354124cfe3",
    uniswapV2RouterABI: uniswapV2RouterABI,
    rwa: "0xf4BFA2a806898346410bb22CabE133A5e6f5BA8D",
    rwaABI: rwaABI,
    market: "0x27C4d57cc9e8535bf9609EE6E1f9AB9d8c3E7A3e",
    marketABI: marketABI,
    form: "0xBFC5E44b50329ca13Ea784cd2C2266f735C65860",
    formABI: formABI,
    rent: "0xaBbd689Cee890D645ea1D89F5F9146b4964293B3",
    rentABI: rentABI,
    voting: "0x0675d7f6434afdd724507e41f9f0bb5c39ce166b",
    votingABI: votingABI,
    usdc: "0x49C614102F28Aa91d0Fc8A05fDa22c15873De2bD",
    usdcABI: usdcABI,
    supportedChain: sepolia,
    // rpcUrl:
    //   "https://eth-sepolia.g.alchemy.com/v2/-VVP2mqehOvdG-zqsAs8xCZwWrIP63ho",
    rpcUrl:
      "https://eth-sepolia.g.alchemy.com/v2/CNLkMN9pdZbC0PITTmpCpa0Th4jqEhDQ",
    explorerBaseUrl: "https://sepolia.etherscan.io",
    subgraphUrls: {
      market_url:
        "https://api.studio.thegraph.com/query/72710/bitstaker-rwa-sepolia-market/v0.0.2",
      form_url:
        "https://api.studio.thegraph.com/query/72710/bitstaker-rwa-sepolia-form/v0.0.2",
      rent_url:
        "https://api.studio.thegraph.com/query/72710/bitstaker-rwa-sepolia-rent/v0.0.2",
      voting_url:
        "https://api.studio.thegraph.com/query/114282/bitstaker-rwa-sepolia-voting/v0.0.3",
      rwa_url:
        "https://api.studio.thegraph.com/query/114282/bitstaker-rwa-sepolia-rwa/v0.0.2",
    },
    rentDuration: 60 * 15, // 15 minutes in seconds
    votingDuration: 60 * 15, // 15 minutes in seconds
    usdcDecimals: 18, // 15 minutes in seconds
  },
  local: {
    uniswapV2Weth: "",
    uniswapV2Router: "",
    uniswapV2RouterABI: uniswapV2RouterABI,
    voting: "",
    votingABI: votingABI,
    market: "0x1D85000cF34077D007582294DABa45781080BbbC",
    marketABI: marketABI,
    rent: "",
    rentABI: rentABI,
    form: "0x24bEC77356332281f3BF759D94eE5d35483eB9FD",
    formABI: formABI,
    rwa: "0xA3ed6D233A2DFF2C472442d06261Bfc558dC8549",
    rwaABI: rwaABI,
    usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    usdcABI: usdcABI,
    supportedChain: localhost,
    rpcUrl: "http://127.0.0.1:8545/",
    explorerBaseUrl: "",
    subgraphUrls: {
      market_url: "",
      form_url: "",
      rent_url: "",
      voting_url: "",
      rwa_url: "",
    },
    rentDuration: 86400 * 30, // 30 days in seconds
    votingDuration: 86400 * 30, // 30 days in seconds
    usdcDecimals: 6, // 30 days in seconds
  },
};

export const BITSTAKE_CONFIG: ConfigType = CONFIG_MAP[ENVIRONMENT];

const WERT_CONFIG_MAP: Record<EnvType, WertConfigType> = {
  main: {
    network: "miannet",
    commodity: "ETH",
    partnerId: "",
    origin: "",
    privateKey: "",
  },
  test: {
    network: "sepolia",
    commodity: "ETH",
    partnerId: "01J7X9Z3XPYFTK13JG8R74F6E6",
    origin: "https://sandbox.wert.io",
    privateKey:
      "0x57466afb5491ee372b3b30d82ef7e7a0583c9e36aef0f02435bd164fe172b1d3",
  },
  local: {
    network: "miannet",
    commodity: "ETH",
    partnerId: "",
    origin: "",
    privateKey: "",
  },
};
export const WERT_CONFIG: WertConfigType = WERT_CONFIG_MAP[ENVIRONMENT];

export const SALT_ETH = 0.00000001;
export const BACKEND_BASE_URL =
  "https://bitstake-rwa-marketplace-backend.vercel.app";

// Exporting the default array of image URLs using the `src` property
export const DEFAULT_IMAGES: string[] = [
  notFoundImage.src,
  notFoundImage.src,
  notFoundImage.src,
  notFoundImage.src,
  notFoundImage.src,
];
export const PLATFORM_LOGO: string = penthianLogo.src;
export const MIN_SALETIME: number = 5 * 60; //TODO: change to 1 hour for mainnet in seconds
export const MAX_SALETIME: number = 180 * 86400; //TODO: change to 180 days for mainnet in seconds

export const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2MGMwMmIwZi01YjZmLTRlZmYtODhmNS1mZmJjMzY3ODQ5NzgiLCJlbWFpbCI6ImJpdHN0YWtlcGxhdGZvcm1AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImZiM2VjMzA3ZTNkZTJhNmRjODlkIiwic2NvcGVkS2V5U2VjcmV0IjoiYjRjZGE4NTA1YjE5MWM1NWE3NWZjOTNlZWIzYmU0ZDUwNTg0YzkyNjY5ZGIzN2U4MWUwN2ZiZDMwN2JhMzUzOCIsImV4cCI6MTc1ODk3NjQyOX0.rg-uBvOr-LnGCM89QfKYjgRJM8QgwcgdbT7ELa8bUsQ";

export const GATEWAY_URL = "https://ipfs.io/ipfs/"; //default
// const GATEWAY_URL = 'https://jade-oral-swallow-381.mypinata.cloud/ipfs/' //dedicated

export const PARTICLE_OPTIONS = {
  //TODO: client provided keys
  projectId: "c0f5a469-ea09-4674-abf5-f1dead0b6920",
  clientKey: "c6zg9s9UZBUWPMmfwOtnFCLRh4yfGU3TvASWAO2f",
  appId: "4b44551c-8499-4a93-9d5e-003915c33d22",
  customStyle: {
    zIndex: 2147483650, // must greater than 2147483646
  },
};
export const WALLET_CONNECT_PROJECT_ID = "739e1b6df1475b28c372b00a8c67064a";

// constants.ts
export const MIN_START_OFFSET_MS = 5 * 60 * 1000; // 5 minutes in ms
export const MIN_AUCTION_DURATION_MS = 15 * 60 * 1000; // 15 minutes in ms

export const MARKET_BASE = 10000;
export const maxDescriptionLength = 200;
export const GOOGLE_MAP_KEY = "AIzaSyBjKx_4B8fBfnnTNB2c8qlyAT3p2OoNt6c";

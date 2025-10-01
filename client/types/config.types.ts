import { Chain } from "viem";

export type ConfigType = {
  uniswapV2Weth: string;
  uniswapV2Router: string;
  uniswapV2RouterABI: any;
  voting: string;
  votingABI: any;
  rent: string;
  rentABI: any;
  market: string;
  marketABI: any;
  form: string;
  formABI: any;
  rwaABI: any;
  rwa: string;
  usdc: string;
  usdcABI: any;
  rpcUrl: string;
  supportedChain: Chain;
  explorerBaseUrl: string;
  subgraphUrls: {
    market_url: string;
    form_url: string;
    rent_url: string;
    voting_url: string;
    rwa_url: string;
  };
  rentDuration: number;
  votingDuration: number;
  usdcDecimals: number;
};
export type WertConfigType = {
  network: "miannet" | "sepolia";
  commodity: "ETH";
  partnerId: string;
  origin: string;
  privateKey: string;
};

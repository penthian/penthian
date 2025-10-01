"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  particleGoogleWallet,
  particleTwitterWallet,
  particleWallet,
} from "./particleWallet";
import { BITSTAKE_CONFIG, WALLET_CONNECT_PROJECT_ID } from "../utils/constants";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        particleGoogleWallet,
        particleTwitterWallet,
        particleWallet,
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "Bitstake RWA",
    projectId: WALLET_CONNECT_PROJECT_ID,
  }
);

const config = createConfig({
  connectors,
  chains: [BITSTAKE_CONFIG.supportedChain],
  transports: {
    [BITSTAKE_CONFIG.supportedChain.id]: http(
      BITSTAKE_CONFIG.rpcUrl
    ),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function ParticleWalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

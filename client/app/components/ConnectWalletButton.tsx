"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnect as useParticleConnectAuth } from "@particle-network/auth-core-modal";
import { EthereumSepolia, Ethereum } from "@particle-network/chains";
import { useConnect, useDisconnect } from "wagmi";
import {
  AuthCoreEvent,
  SocialAuthType,
  getLatestAuthType,
  isSocialAuthType,
  particleAuth,
} from "@particle-network/auth-core";
import { useEffect } from "react";
import { particleWagmiWallet } from "../context/particleWallet/particleWagmiWallet";
import { Loader } from "lucide-react";
import { useBitStakeContext } from "../context/BitstakeContext";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ENVIRONMENT } from "../utils/constants";
export const ConnectWalletButton = ({
  isSmallScreen = false,
}: {
  isSmallScreen?: boolean;
}) => {
  const { accountLoading } = useBitStakeContext();
  const { connect } = useConnect();
  const { connectionStatus } = useParticleConnectAuth();
  const { disconnect } = useDisconnect();
  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      isSocialAuthType(getLatestAuthType())
    ) {
      connect({
        connector: particleWagmiWallet({
          socialType: getLatestAuthType() as SocialAuthType,
        }),
        chainId: ENVIRONMENT == "main" ? Ethereum.id : EthereumSepolia.id, //TODO: change if for multi chain
      });
    }
    const onDisconnect = () => {
      disconnect();
    };
    particleAuth.on(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
    return () => {
      particleAuth.off(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
    };
  }, [connect, connectionStatus, disconnect]);
  // end: fix social auth login

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div>
            {(() => {
              if (accountLoading) {
                return (
                  <Button disabled={true}>
                    <Loader className="animate-spin" />
                  </Button>
                );
              }
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    disabled={!ready}
                    className={cn(!ready && "cursor-not-allowed")}
                  >
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                openChainModal();
                return (
                  <Button onClick={openChainModal} variant="destructive">
                    Wrong network
                  </Button>
                );
              }
              if (isSmallScreen) {
                return (
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className="w-full sm:w-fit"
                  >
                    {account.displayName}
                  </Button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className="w-full sm:w-fit"
                  >
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

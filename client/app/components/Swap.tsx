"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Info, ArrowLeftRight, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { debounce, NotifyError } from "../context/helper";
import { useBitStakeContext } from "../context/BitstakeContext";
import {
  getUniswapQuote,
  swapEthToUsdc,
  swapUsdcToEth,
} from "../context/helper-uniswap-v2";
import { useAccount } from "wagmi";
import { Skeleton } from "./ui/Skeleton";

export default function Swap({ className }: { className?: string }) {
  const { particleProvider } = useBitStakeContext();
  const { address: connectedAddress } = useAccount();
  const [cryptoAmount, setCryptoAmount] = useState<number | null>(null);
  const [cryptoReceiveAmount, setCryptoReceiveAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<"usdc" | "eth">("usdc");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const latestAmountRef = useRef<number | null>(null);

  // compute the opposite asset
  const receiveCrypto = selectedCrypto === "usdc" ? "eth" : "usdc";

  const handleSwap = async () => {
    if (!connectedAddress) {
      return NotifyError("Please connect wallet.");
    }
    if (!cryptoAmount || cryptoAmount <= 0) {
      return NotifyError("Please enter a valid amount.");
    }

    setLoading(true);

    try {
      if (selectedCrypto === "eth") {
        await swapEthToUsdc(cryptoAmount, connectedAddress, particleProvider);
      } else {
        await swapUsdcToEth(cryptoAmount, connectedAddress, particleProvider);
      }
    } catch (error) {
      console.log("Swap failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = async (amount: number, selected: "usdc" | "eth") => {
    setQuoteLoading(true);
    try {
      const quote = await getUniswapQuote(amount, selected);
      const rounded = parseFloat(quote).toFixed(8);

      if (
        latestAmountRef.current !== null &&
        latestAmountRef.current === amount
      ) {
        setCryptoReceiveAmount(rounded);
      }
    } catch (err) {
      console.log("Quote fetch failed", err);
      setCryptoReceiveAmount(""); // Empty if failed
    } finally {
      setQuoteLoading(false);
    }
  };

  const swapCurrencies = () => {
    setSelectedCrypto(receiveCrypto);
    debouncedHandleQuote(cryptoAmount ?? 0, receiveCrypto); // Update quote on currency change
  };

  // Debounced version of handleQuote
  const debouncedHandleQuote = useCallback(
    debounce((amount: number, selectedCrypto: "usdc" | "eth") => {
      handleQuote(amount, selectedCrypto);
    }, 800),
    []
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value ? parseFloat(e.target.value) : null;
    latestAmountRef.current = amount; // Track current amount
    setCryptoAmount(amount);

    if (amount !== null && amount > 0 && !isNaN(amount)) {
      debouncedHandleQuote(amount, selectedCrypto);
    } else {
      setQuoteLoading(false);
      setCryptoReceiveAmount(""); // Clear output immediately
    }
  };

  return (
    <div className={cn(`w-full`, className)}>
      <Card className="w-full 3xl:gap-0 py-4 3xl:py-0">
        <CardContent className="space-y-4 3xl:space-y-6 px-4 3xl:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {/* You're Paying */}
            <div className="bg-lightBlue rounded-lg p-4 w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-grey-6">
                  {"You're Sending"}
                </span>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-grey-6 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter the amount you want to pay
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-3">
                <Input
                  type="number"
                  value={cryptoAmount ?? ""}
                  min={0}
                  onChange={handleAmountChange}
                  className="text-xl 3xl:text-2xl font-bold bg-transparent text-black border-none p-0 h-auto focus-visible:ring-0 rounded-none"
                  placeholder="0.0000"
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />

                <div className="relative w-full">
                  <select
                    value={selectedCrypto}
                    onChange={(e) => {
                      const value = e.target.value as "usdc" | "eth";
                      setSelectedCrypto(value);
                      debouncedHandleQuote(cryptoAmount ?? 0, value); // Update quote on currency change
                    }}
                    className="w-full appearance-none bg-navBlue text-black font-medium rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="usdc">USDC</option>
                    <option value="eth">ETH</option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-black">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Icon */}
            <div
              onClick={swapCurrencies}
              className="cursor-pointer flex justify-center w-10"
            >
              <div className="w-8 h-8 text-grey-2 rounded-full flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 rotate-90 sm:rotate-0" />
              </div>
            </div>

            {/* You're Buying */}
            <div className="bg-lightBlue rounded-lg p-4 w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-grey-6">
                  {"You'll Recieve"}
                </span>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-grey-6 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Estimated amount you’ll receive
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-3">
                <div className="text-xl 3xl:text-2xl font-bold text-black">
                  {quoteLoading ? (
                    <Skeleton className="h-7 w-32" />
                  ) : cryptoReceiveAmount ? (
                    cryptoReceiveAmount
                  ) : (
                    <span className="text-grey-5">0.0000</span>
                  )}
                </div>
                <div className="relative flex items-center justify-between gap-2 bg-navBlue text-black rounded-lg px-3 py-2">
                  <span className="font-medium">
                    {receiveCrypto.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <Button className="w-full" onClick={handleSwap} loading={loading}>
            Swap Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";

type Props = {
  agentAddress: string;
};

const ReferralLinkButton = ({ agentAddress }: Props) => {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const fullUrl = useMemo(() => {
    if (!baseUrl || !pathname || !agentAddress) return "";
    return `${baseUrl}${pathname}?agent=${agentAddress.toLowerCase()}`;
  }, [baseUrl, pathname, agentAddress]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log("Failed to copy referral link", err);
    }
  };

  if (!fullUrl) return null;

  return (
    <Button onClick={handleCopy} aria-label="Copy Referral Link" size="sm">
      {copied ? "Copied!" : "Copy Referral Link"}
    </Button>
  );
};

export default ReferralLinkButton;

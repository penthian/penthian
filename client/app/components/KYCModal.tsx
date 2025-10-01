"use client";

import { useEffect } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { useKYCModal } from "../context/KYCModalContext";
import { BACKEND_BASE_URL } from "../utils/constants";
import { MESSAGES } from "@veriff/incontext-sdk";
declare global {
  interface Window {
    Veriff?: any;
    veriffSDK?: any;
  }
}

const KYCModal = () => {
  const { showModal, closeModal, checkKycStatus, kycStatus, setKycStatus } =
    useKYCModal();
  const { address: account } = useAccount();

  useEffect(() => {
    if (!showModal || !account || kycStatus === "pending") return;

    const loadScriptsAndStart = async () => {
      const script1 = document.createElement("script");
      script1.src = "https://cdn.veriff.me/sdk/js/1.5/veriff.min.js";
      script1.async = true;
      document.body.appendChild(script1);

      const script2 = document.createElement("script");
      script2.src = "https://cdn.veriff.me/incontext/js/v1/veriff.js";
      script2.async = true;
      document.body.appendChild(script2);

      script2.onload = () => {
        if (window.Veriff) {
          const veriff = window.Veriff({
            host: "https://stationapi.veriff.com",
            apiKey: process.env.NEXT_PUBLIC_VERIFF_API_KEY,
            parentId: "veriff-root",
            onSession: async (err: any, response: any) => {
              if (!err && response?.verification) {
                try {
                  
                  // Render Veriff iframe
                  window.veriffSDK.createVeriffFrame({
                    url: response.verification.url,
                    onEvent: async function (msg: string) {
                      if (msg === MESSAGES.FINISHED) {
                        // Save session in backend
                        await axios.post(`${BACKEND_BASE_URL}/api/kyc/save-session`, {
                          walletAddress: account,
                          sessionId: response.verification.id,
                        });
                        setKycStatus("pending");
                        await checkKycStatus(account);
                        closeModal();
                      }
                    },
                  });
                } catch (error) {
                  console.error("Error saving session:", error);
                }
              }
            },
          });

          veriff.setParams({
            person: { givenName: " ", lastName: " " },
            vendorData: account.toLowerCase(),
          });

          veriff.mount();
        }
      };
    };

    loadScriptsAndStart();

    return () => {
      const root = document.getElementById("veriff-root");
      if (root) root.innerHTML = "";
    };
  }, [showModal, account, kycStatus]);

  if (!showModal) return null;

  if (kycStatus === "pending")
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50 ">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full flex flex-col justify-center items-center min-h-[500px] max-w-3xl mx-auto">
          <p className="mb-6">We have received your KYC. Review in progress.</p>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50 ">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full flex flex-col justify-center items-center min-h-[500px] max-w-3xl mx-auto">
        <p className="mb-6">Complete KYC to keep using Penthian.</p>

        {/* Veriff SDK mounts iframe here */}
        <div id="veriff-root" className="w-full h-full" />
      </div>
    </div>
  );
};

export default KYCModal;

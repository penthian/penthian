"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { BACKEND_BASE_URL } from "../utils/constants";
import { useAccount } from "wagmi";

interface ModalContextProps {
  showModal: boolean;
  openModal: (_account: string) => Promise<void>;
  closeModal: () => void;
  kycStatus: string;
  checkKycStatus: (_account: string) => Promise<void>
  setKycStatus: Dispatch<SetStateAction<string>>
}

const KYCModalContext = createContext<ModalContextProps | undefined>(undefined);

export const useKYCModal = () => {
  const context = useContext(KYCModalContext);
  if (!context) {
    throw new Error("useKYCModal must be used within a KYCModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const KYCModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [kycStatus, setKycStatus] = useState("");
  const { address: account } = useAccount();

  const closeModal = () => {
    setShowModal(false);
  };

  // Open modal and start Veriff
  const openModal = async (_account: string) => {
    setShowModal(true);
  };

  // Check wallet KYC status on connect
  const checkKycStatus = async (_account: string) => {
    try {
      const resp = await axios.get(
        `${BACKEND_BASE_URL}/api/kyc/status/${_account}`
      );
      if (resp.data?.data?.decision == "approved") {
        // Already has a decision (completed/declined)
        setKycStatus("completed");
        setShowModal(false);
      } else if (resp.data?.data?.decision == "pending") {
        // Already has a decision (completed/declined)
        setKycStatus("pending");
        setShowModal(true);
      } else {
        // No decision → open KYC modal
        setKycStatus("");
        setShowModal(true);
      }
    } catch (err: any) {
      console.error("Error checking KYC status:", err.message);
    }
  };

  useEffect(() => {
    if (!account) return;
    checkKycStatus(account);
  }, [account]);

  return (
    <KYCModalContext.Provider
      value={{ showModal, openModal, closeModal, kycStatus, checkKycStatus,setKycStatus }}
    >
      {children}
    </KYCModalContext.Provider>
  );
};

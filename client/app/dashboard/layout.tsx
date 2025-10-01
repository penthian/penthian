import "@rainbow-me/rainbowkit/styles.css";
import { BitStakeProvider } from "@/app/context/BitstakeContext";
import { Toaster } from "react-hot-toast";
import { AuthCoreContextProvider } from "@particle-network/auth-core-modal";
import { ParticleWalletContextProvider } from "../context/ParticleWalletContext";
import { KYCModalProvider } from "../context/KYCModalContext";
import KYCModal from "../components/KYCModal";
import { PARTICLE_OPTIONS } from "../utils/constants";
import { satoshi } from "../fonts";

export const metadata = {
  title: "PENTHIAN",
  description: "PENTHIAN: User Dashbaord",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthCoreContextProvider
      options={PARTICLE_OPTIONS}
    >
      <ParticleWalletContextProvider>
        <KYCModalProvider>
          <BitStakeProvider>
            <Toaster position="top-center" />
            <div className={satoshi.className}>
              {children}
            </div>
          </BitStakeProvider>
        </KYCModalProvider>
      </ParticleWalletContextProvider>
    </AuthCoreContextProvider>
  );
}

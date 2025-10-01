import React from "react";
import Image from "next/image";
import Link from "next/link";
import { amlPolicy } from "@/app/MockData/amlPolicy";
import { termsAndConditions } from "@/app/MockData/termsAndConditions";
import { productDisclosure } from "@/app/MockData/productDisclosure";
import LandingPageContainer from "./landingPage/LandingPageContainer";
import { PolicyDialogItem } from "./PolicyDialogItem";
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";

function Footer() {

  const companyLinks = [
    { name: "About Us", href: "/about-us" },
    { name: "Team", href: "/#" },
    { name: "Vision", href: "/vision" },
    { name: "Careers", href: "/career" },
  ]

  const productLinks = [
    // { name: "How It Works", href: "/#" },
    { name: "Secondary Market", href: "/dashboard/secondary-marketplace" },
    { name: "Wallet", href: "/wallet" },
    { name: "FAQs", href: "/#faqs" },
  ]

  const legalLinks = [
    { name: "Terms of Service", href: "/#" },
    { name: "Privacy Policy", href: "/#" },
    { name: "Compliance", href: "/#" },
  ]

  const socialLinks = [
    { name: "Instagram", href: "https://www.instagram.com/penthiandapp/", icon: Instagram },
    { name: "Twitter", href: "https://x.com/penthiandapp/", icon: Twitter },
    { name: "Facebook", href: "https://www.facebook.com/penthiandapp/", icon: Facebook },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/penthian/", icon: Linkedin },
  ]

  return (
    <>
      <footer className="bg-cream px-4">
        <LandingPageContainer className="py-12 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-8 lg:gap-12">
            {/* Logo and Address Section */}
            <div className="lg:col-span-4 col-span-2 space-y-6 text-center sm:text-start">

              <Link href="/" className="inline-block">
                <Image
                  src="/assets/logo.svg"
                  alt="Logo"
                  width={200}
                  height={40}
                  className="hidden sm:block"
                />
                <Image
                  src="/assets/logo.svg"
                  alt="Logo"
                  width={200}
                  height={30}
                  className="sm:hidden"
                />
              </Link>

              <div className="space-y-2">
                {/* <h3 className="uppercase tracking-wider">Address</h3> */}
                <p className="font-medium">
                  Level 2/627 Chapel St, South Yarra VIC 3141
                </p>
              </div>

              {/* Social Media Links */}
              <div className="flex justify-center sm:justify-start space-x-4">
                <Link href="mailto:Info@penthian.com" className="text-pitchBlack hover:text-gray-600 transition-colors">
                  <Mail className="w-5 h-5" />
                  <span className="sr-only">Email</span>
                </Link>
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pitchBlack hover:text-gray-600 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-gray-900 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li key={'contact'}>
                  <Link href="mailto:Info@penthian.com" className="text-pitchBlack hover:text-gray-600 transition-colors">
                    Contact
                    <span className="sr-only">Email</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Product</h3>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-gray-900 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Legal</h3>
              <ul className="flex flex-col gap-4 text-start">
                <PolicyDialogItem
                  dialogTitle="AML Policy"
                  dialogContent={amlPolicy.content}
                />
                <PolicyDialogItem
                  dialogTitle="Terms and Conditions"
                  dialogContent={termsAndConditions.content}
                />
                <PolicyDialogItem
                  dialogTitle="Product Disclosure Statement"
                  dialogContent={productDisclosure.content}
                />
              </ul>
            </div>
          </div>

          {/* Copyright Section */}
          {/* <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-500">© {currentYear} Penthian. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div> */}
        </LandingPageContainer>
      </footer>
    </>
  );
}

export default Footer;

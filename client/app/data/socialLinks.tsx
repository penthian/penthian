import { Facebook, Linkedin, Mail, Twitter } from "lucide-react";
import { FaDiscord, FaInstagram, FaMedium, FaTelegram } from "react-icons/fa";

export const socialLinks = [
    {
        platform: "Facebook",
        url: "https://www.facebook.com/penthiandapp/",
        icon: <Facebook />,
    },
    {
        platform: "Instagram",
        url: "https://www.instagram.com/penthiandapp/",
        icon: <FaInstagram size={24} />,
    },
    {
        platform: "Twitter",
        url: "https://x.com/penthiandapp/",
        icon: <Twitter size={24} />,
    },
    {
        platform: "LinkedIn",
        url: "https://www.linkedin.com/company/penthian/",
        icon: <Linkedin />,
    },
];
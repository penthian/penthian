import { ComponentType } from "react";
import { ArrowLeftRight, Building2, Coins, DatabaseZap, FileCog, Hand, Loader, LucideProps, PiggyBank, ShoppingCart, Store, Vote } from "lucide-react";

interface LinkItem {
    href: string;
    label: string;
    icon?: ComponentType<LucideProps>;
    description?: string;
}

export interface HeaderLinksType {
    title: string;
    links: LinkItem[];
}

interface Links {
    title: string;
    href: string;
    disabled?: boolean;
    external?: boolean;
    label?: string;
    description?: string;
}

export const headerLinks: HeaderLinksType[] = [
    {
        title: 'Requests',
        links: [
            {
                href: "/dashboard/property-requests",
                label: "Listing Requests",
                icon: Building2,
                description: "Submit a new property request and track the status of your existing requests."
            }
        ]
    },
    {
        title: "Market",
        links: [
            {
                href: "/dashboard/primary-marketplace",
                label: "Primary Marketplace",
                icon: ShoppingCart,
                description: "Buy and Sell Real Estate Within Seconds",
            },
            {
                href: "/dashboard/secondary-marketplace",
                label: "Secondary Marketplace",
                icon: ShoppingCart,
                description: "Buy and Sell Real Estate Within Seconds",
            },
            {
                href: "/dashboard/auction",
                label: "Auction",
                icon: Hand,
                description: "Auction within seconds",
            },
            {
                href: "/dashboard/vote",
                label: "Vote",
                icon: Vote,
                description: "Real World Assets Voting Proposals"
            },
            {
                href: "/dashboard/rent",
                label: "Rent",
                icon: Coins,
                description: "Claim your available rent"
            },
            {
                href: "/dashboard/swap",
                label: "Swap",
                icon: ArrowLeftRight,
                description: "Swap your amount to check its value"
            }
        ],
    },
    {
        title: "My Profile",
        links: [
            {
                href: "/dashboard/my-pending-shares",
                label: "My Holdings",
                icon: Loader,
                description: "Your pending stakes information here",
            },
            {
                href: "/dashboard/my-properties",
                label: "My Properties",
                icon: Building2,
                description: "Real Estate You’ve Purchased",
            },
        ],
    },
];

export const adminheaderLinks: HeaderLinksType[] = [
    {
        title: "Dashboard",
        links: [
            {
                href: "/dashboard/admin-setting",
                label: "Admin Dashboard",
                icon: ShoppingCart,
                description: "Admin can view agent information and overall site metrics here.",
            }
        ],
    },
    {
        title: "Admin Settings",
        links: [
            {
                href: "/dashboard/admin-setting/form-settings",
                label: "Form Settings",
                icon: FileCog,
                description: "Admin can view requested properties information here",
            },
            {
                href: "/dashboard/admin-setting/market-settings",
                label: "Market Settings",
                icon: Store,
                description: "Admin can conclude primary listings and adjust related fees here",
            },
            {
                href: "/dashboard/admin-setting/rent-settings",
                label: "Rent Settings",
                icon: PiggyBank,
                description: "Manage rent settings for your properties",
            },
            {
                href: "/dashboard/admin-setting/voting-settings",
                label: "Voting Settings",
                icon: DatabaseZap,
                description: "Manage voting settings for your properties",
            },
        ],
    },
];

export const navItems: Links[] = [
    {
        title: "Home",
        href: "/",
        label: "Home",
    },
    {
        title: "About",
        href: "/about-us",
        label: "About",
    },
    {
        title: "Properties",
        href: "/dashboard/secondary-marketplace",
        label: "Properties",
    },
    {
        title: "Owners Club",
        href: "https://ownersclub.penthian.com/",
        label: "Owners Club",
    },
];
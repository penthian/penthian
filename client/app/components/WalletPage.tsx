import Section from "./layout/section-box";
import { Card, CardContent } from "./ui/card";

function WalletPage() {

    return (
        <Section
            imageSrc={"/assets/wallet-page-desktop.png"}
            mobileSrc="/assets/wallet-page-mobile.png"
            className="min-h-screen z-10"
        >
            <Card className="max-w-xs w-full mx-auto">
                <CardContent>
                    <h2 className="text-xl sm:text-2xl 3xl:text-3xl font-medium text-center">
                        Coming Soon
                    </h2>
                </CardContent>
            </Card>
        </Section>
    );
}

export default WalletPage;

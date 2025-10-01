import Image from "next/image";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { HeadingPara } from "../layout/heading";

interface ProposalModalProps {
    isOpen: boolean;
    product: any; // You can type this more specifically based on your product shape
    proposalText: string;
    setProposalText: (text: string) => void;
    onClose: () => void;
    onCreateProposal: () => void;
    isLoading: boolean;
    createProposalLoading: boolean;
}

const ProposalModal: React.FC<ProposalModalProps> = ({
    isOpen,
    product,
    proposalText,
    setProposalText,
    onClose,
    onCreateProposal,
    isLoading,
    createProposalLoading,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <Card className="w-full sm:w-[580px] max-h-[90dvh] overflow-hidden">
                <CardContent className="space-y-6">
                    {/* Product */}
                    <div className="w-full h-full">
                        <Image
                            src={(product?.image as string) || "/placeholder.svg"}
                            alt="product"
                            width={500}
                            height={500}
                            className="w-full object-cover h-40 3xl:h-48 rounded-2xl"
                        />
                    </div>

                    <HeadingPara title={product?.name} classNameTitle="text-black !text-lg" />

                    {/* Input */}
                    <div className="space-y-4">
                        <Label>
                            Proposal Description
                        </Label>
                        <Textarea
                            placeholder="Proposal description here"
                            value={proposalText}
                            className="min-h-20 max-h-40"
                            onChange={(e) => setProposalText(e.target.value)}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={onClose}
                            disabled={createProposalLoading || isLoading}
                            className="w-full"
                            variant='outline'
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onCreateProposal}
                            loading={createProposalLoading}
                            className="w-full"
                        >
                            {createProposalLoading ? "Creating Proposal ..." : "Create Proposal"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProposalModal;

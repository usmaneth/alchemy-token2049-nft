import { useState, useEffect } from "react";
import {
  ExternalLink,
  Loader2,
  PlusCircle,
  ImageIcon,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useReadNFTData } from "@/app/hooks/useReadNFTData";
import { useClaimNFT } from "@/app/hooks/useClaimNFT";
import { useSmartAccountClient } from "@account-kit/react";
import { NFT_CONTRACT_ADDRESS } from "@/lib/constants";

export default function NftClaimCard() {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(true);

  const { client } = useSmartAccountClient({});

  const { uri, count, isLoadingCount, refetchCount } = useReadNFTData({
    contractAddress: NFT_CONTRACT_ADDRESS,
    ownerAddress: client?.account?.address,
  });

  const { isClaiming, handleClaim, error, transactionUrl } = useClaimNFT({
    onSuccess: () => {
      refetchCount();
    },
  });

  // Reset success animation when new transaction appears
  useEffect(() => {
    if (transactionUrl) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [transactionUrl]);

  const hasClaimed = count && count > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="mb-2">Claim your exclusive NFT</CardTitle>
            <CardDescription>
              Claim your exclusive "Alchemy x Token2049 Alpha" NFT with no
              gas fees, powered by Alchemy's Account Kit and gas sponsorship.
            </CardDescription>
          </div>
          <Badge
            className="ml-2 px-4 py-2 flex items-center justify-center whitespace-nowrap text-lg font-semibold"
            variant="outline"
          >
            {isLoadingCount ? "..." : count ?? 0} NFTs
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary/40" />
              </div>
            </div>
          )}
          <div className="aspect-[4/3] md:aspect-[16/9] w-full relative">
            <Image
              src={
                hasClaimed && uri
                  ? uri
                  : "/Token2049_Alchemy2025_PatchDesign_PrintFiles.jpg"
              }
              alt="NFT Image"
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                isImageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="font-semibold text-lg text-white">
              Alchemy x Token2049 Alpha NFT
            </h3>
            <p className="text-sm opacity-90 text-white">
              Exclusive NFT collection • Gas-free claiming
            </p>
          </div>
          <div className="absolute bottom-[-30px] right-0 bg-transparent p-4">
            <p className="text-xs text-gray-400">Powered by Polygon Amoy</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 break-words overflow-hidden">
              Error: {error}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
          <Button
            className="w-full sm:w-auto gap-2 relative overflow-hidden group"
            size="lg"
            onClick={handleClaim}
            disabled={isClaiming || count && count > 0}
          >
            <span
              className={cn(
                "flex items-center gap-2 transition-transform duration-300",
                isClaiming ? "translate-y-10" : ""
              )}
            >
              <PlusCircle className="h-[18px] w-[18px]" />
              {count && count > 0 ? "Already Claimed" : "Claim NFT"}
            </span>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-transform duration-300",
                isClaiming ? "translate-y-0" : "translate-y-10"
              )}
            >
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Claiming...
            </span>
          </Button>

          <div className="flex-1"></div>

          {transactionUrl && (
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "gap-2 w-full sm:w-auto relative overflow-hidden transition-all duration-500",
                "border-green-400 text-green-700 hover:bg-green-50",
                "animate-in fade-in duration-700"
              )}
            >
              <Link
                href={transactionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                {showSuccess ? (
                  <>
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-10"
                      style={{
                        animation: "sweep 1.5s ease-out",
                      }}
                    />
                    <span className="relative z-10">Successfully Claimed!</span>
                    <CheckCircle className="h-4 w-4 relative z-10" />
                    <style jsx>{`
                      @keyframes sweep {
                        0% {
                          transform: translateX(-100%);
                          opacity: 0;
                        }
                        50% {
                          opacity: 0.2;
                        }
                        100% {
                          transform: translateX(100%);
                          opacity: 0;
                        }
                      }
                    `}</style>
                  </>
                ) : (
                  <>
                    <span>View Transaction</span>
                    <ExternalLink className="h-4 w-4" />
                  </>
                )}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

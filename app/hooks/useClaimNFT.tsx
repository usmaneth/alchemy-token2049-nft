import { useCallback, useMemo, useState } from "react";
import {
  useSmartAccountClient,
  useSendUserOperation,
} from "@account-kit/react";
import { encodeFunctionData } from "viem";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "@/config";

export interface UseClaimNFTParams {
  onSuccess?: () => void;
}
export interface UseClaimReturn {
  isClaiming: boolean;
  handleClaim: () => void;
  transactionUrl?: string;
  error?: string;
}

export const useClaimNFT = ({ onSuccess }: UseClaimNFTParams): UseClaimReturn => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string>();

  const { client } = useSmartAccountClient({});

  const handleSuccess = () => {
    setIsClaiming(false);
    setError(undefined);
    onSuccess?.();
  };

  const handleError = (error: Error) => {
    console.error("Claim error:", error);
    setIsClaiming(false);
    setError(error.message || "Failed to claim NFT");
  };

  const { sendUserOperationResult, sendUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onError: handleError,
    onSuccess: handleSuccess,
    onMutate: () => {
      setIsClaiming(true);
      setError(undefined);
    },
  });

  const handleClaim = useCallback(async () => {
    if (!client) {
      setError("Wallet not connected");
      return;
    }

    sendUserOperation({
      uo: {
        target: NFT_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: NFT_CONTRACT_ABI,
          functionName: "claim",
        }),
      },
    });
  }, [client, sendUserOperation]);

  const transactionUrl = useMemo(() => {
    if (!client?.chain?.blockExplorers || !sendUserOperationResult?.hash) {
      return undefined;
    }
    return `${client.chain.blockExplorers.default.url}/tx/${sendUserOperationResult.hash}`;
  }, [client, sendUserOperationResult?.hash]);

  return {
    isClaiming,
    handleClaim,
    transactionUrl,
    error,
  };
};

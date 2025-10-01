import { useSmartAccountClient } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "@/config";

interface UseReadNFTUriParams {
  contractAddress?: Address;
  ownerAddress?: Address;
}

export const useReadNFTData = (props: UseReadNFTUriParams) => {
  const { contractAddress, ownerAddress } = props;

  const { client } = useSmartAccountClient({});

  const {
    data: hasClaimed,
    isLoading: isLoadingHasClaimed,
    error: hasClaimedError,
    refetch: refetchHasClaimed,
  } = useQuery<boolean | undefined, Error, boolean | undefined, readonly unknown[]>(
    {
      queryKey: ["hasClaimed", contractAddress, ownerAddress, client?.chain?.id],
      queryFn: async () => {
        if (!client) {
          throw new Error("Smart account client not ready");
        }
        if (!contractAddress) {
          throw new Error("Contract address is not defined for queryFn.");
        }
        if (!ownerAddress) {
          throw new Error("Owner address is not defined for queryFn.");
        }
        const claimed = await client.readContract({
          address: contractAddress,
          abi: NFT_CONTRACT_ABI,
          functionName: "hasClaimed",
          args: [ownerAddress],
        });
        return claimed as boolean;
      },
      enabled: !!client && !!contractAddress && !!ownerAddress,
    }
  );

  // Query for totalSupply
  const {
    data: totalSupply,
    isLoading: isLoadingTotalSupply,
    error: totalSupplyError,
    refetch: refetchTotalSupply,
  } = useQuery<number | undefined, Error, number | undefined, readonly unknown[]>(
    {
      queryKey: ["totalSupply", contractAddress, client?.chain?.id],
      queryFn: async () => {
        if (!client) {
          throw new Error("Smart account client not ready");
        }
        if (!contractAddress) {
          throw new Error("Contract address is not defined for queryFn.");
        }
        const supply = await client.readContract({
          address: contractAddress,
          abi: NFT_CONTRACT_ABI,
          functionName: "totalSupply",
        });
        return Number(supply);
      },
      enabled: !!client && !!contractAddress && !!hasClaimed,
    }
  );

  // Query for NFT URI
  const {
    data: uri,
    isLoading: isLoadingUri,
    error: uriError,
    refetch: refetchUri,
  } = useQuery<string | undefined, Error, string | undefined, readonly unknown[]>(
    {
      queryKey: ["nftUri", contractAddress, totalSupply, client?.chain?.id],
      queryFn: async () => {
        if (!client) {
          throw new Error("Smart account client not ready");
        }
        if (!contractAddress) {
          throw new Error("Contract address is not defined for queryFn.");
        }
        if (totalSupply === undefined || totalSupply === 0) {
          throw new Error("Total supply is not defined or 0.");
        }
        const tokenId = totalSupply - 1; // Assuming the last minted token is the one owned by the current user
        const tokenUriString = await client.readContract({
          address: contractAddress,
          abi: NFT_CONTRACT_ABI,
          functionName: "tokenURI",
          args: [BigInt(tokenId)],
        });
        const decodedUri = JSON.parse(atob(tokenUriString.split("base64,", 2)[1]));
        return decodedUri.image as string;
      },
      enabled: !!client && !!contractAddress && hasClaimed && totalSupply !== undefined && totalSupply > 0,
    }
  );

  // Query for NFT count (balanceOf)
  const {
    data: count,
    isLoading: isLoadingCount,
    error: countError,
    refetch: refetchCount,
  } = useQuery<number | undefined, Error, number | undefined, readonly unknown[]>(
    {
      queryKey: ["nftBalance", contractAddress, ownerAddress, client?.chain?.id],
      queryFn: async () => {
        if (!client) {
          throw new Error("Smart account client not ready");
        }
        if (!contractAddress) {
          throw new Error("Contract address is not defined for queryFn.");
        }
        if (!ownerAddress) {
          throw new Error("Owner address is not defined for queryFn.");
        }
        const balance = await client.readContract({
          address: contractAddress,
          abi: NFT_CONTRACT_ABI,
          functionName: "balanceOf",
          args: [ownerAddress],
        });
        return Number(balance);
      },
      enabled: !!client && !!contractAddress && !!ownerAddress,
    }
  );

  const refetchAll = () => {
    refetchHasClaimed();
    refetchTotalSupply();
    refetchUri();
    refetchCount();
  };

  return {
    uri,
    count,
    hasClaimed,
    isLoading: isLoadingUri || isLoadingCount || isLoadingHasClaimed || isLoadingTotalSupply,
    isLoadingUri,
    isLoadingCount,
    isLoadingHasClaimed,
    isLoadingTotalSupply,
    error: uriError || countError || hasClaimedError || totalSupplyError,
    uriError,
    countError,
    hasClaimedError,
    totalSupplyError,
    refetchCount: refetchAll,
  };
};

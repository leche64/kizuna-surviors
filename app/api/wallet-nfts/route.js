import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHAPE_CRAFT_KEY_CONTRACT = "0x05aA491820662b131d285757E5DA4b74BD0F0e5F";

export async function GET(req) {
  const walletAddress = req.nextUrl.searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const web3 = createAlchemyWeb3(
      `https://shape-mainnet.g.alchemy.com/v2/${apiKey}`
    );

    // Get all NFTs for the wallet
    const nfts = await web3.alchemy.getNfts({
      owner: walletAddress,
      withMetadata: true, // Include token metadata
    });

    // Transform the response to include only necessary data
    const formattedNfts = nfts.ownedNfts.map((nft) => ({
      contractAddress: nft.contract.address,
      tokenId: nft.id.tokenId,
      title: nft.title,
      description: nft.description,
      tokenType: nft.id.tokenMetadata?.tokenType, // ERC721 or ERC1155
      image: nft.metadata?.image || nft.metadata?.image_url,
      collectionName: nft.contract.name,
    }));

    // Add Shape Craft Key holder check
    const isShapeCraftKeyHolder = nfts.ownedNfts.some(
      (nft) =>
        nft.contract.address.toLowerCase() ===
        SHAPE_CRAFT_KEY_CONTRACT.toLowerCase()
    );

    return NextResponse.json(
      {
        totalCount: nfts.totalCount,
        nfts: formattedNfts,
        isShapeCraftKeyHolder,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { db } from "../../../db";
import { gameStats } from "../../../db/schema";
import { PrivyClient } from "@privy-io/server-auth";

// Initialize Privy client
const privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID, process.env.PRIVY_APP_SECRET);

export async function GET() {
  try {
    return NextResponse.json({ message: "Game over data retrieved successfully" }, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to retrieve game over data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log("GAME OVER RESULTS RECEIVED");
    const data = await request.json();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    // Extract the token (remove 'Bearer ' prefix if present)
    const token = authHeader.replace("Bearer ", "");
    // Verify the user's token
    const { userId } = await privy.verifyAuthToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.log("PRIVY SERVER AUTH VALIDATED - END");

    // Convert UTC timestamp to EST
    const utcDate = new Date(data.timestamp);
    const estDate = new Date(
      utcDate.toLocaleString("en-US", {
        timeZone: "America/New_York",
      })
    );

    // Format the EST date in a readable format
    const formattedDate = estDate.toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Log the received data with formatted timestamp
    console.log("Game Over Stats Received:");
    console.log("Gold:", data.gold);
    console.log("Kills:", data.kills);
    console.log("Wave Number:", data.waveNumber);
    console.log("Time Alive:", data.timeAlive);
    console.log("Timestamp (EST):", formattedDate);
    console.log("User Address:", data.userAddress);
    console.log("Username:", data.username);
    console.log("Profile Image:", data.profileImage);
    console.log("Time Alive MS:", data.timeAliveMS);
    // Save the data to the database
    await db.insert(gameStats).values({
      gold: data.gold,
      kills: data.kills,
      waveNumber: data.waveNumber,
      timeAlive: data.timeAlive,
      timeAliveMS: data.timeAliveMS,
      timestamp: formattedDate,
      username: data.username,
      walletAddress: data.userAddress,
      profileImage: data.profileImage,
    });

    return NextResponse.json(
      {
        message: "Game over data saved successfully",
        data: {
          gold: data.gold,
          kills: data.kills,
          waveNumber: data.waveNumber,
          timeAlive: data.timeAlive,
          timeAliveMS: data.timeAliveMS,
          timestamp: formattedDate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to save game over data" }, { status: 500 });
  }
}

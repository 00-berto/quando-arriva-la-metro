import { connection, NextResponse } from "next/server";
import { getTrackerData } from "@/lib/metro-tracker";

export async function GET() {
  await connection();
  return NextResponse.json(
    getTrackerData(),
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

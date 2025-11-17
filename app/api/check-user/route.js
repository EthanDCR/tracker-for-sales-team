import { NextResponse } from "next/server";
import { checkUserExists } from "@/app/actions";

export async function GET(request) {
  try {
    const exists = await checkUserExists();
    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}

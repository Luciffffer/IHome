import { handleError } from "@/lib/error-handler";
import { FastSceneService } from "@/services/FastSceneService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    await FastSceneService.executeFastScene(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

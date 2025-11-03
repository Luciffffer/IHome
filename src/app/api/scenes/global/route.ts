import { handleError } from "@/lib/error-handler";
import { SceneService } from "@/services/SceneService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const scenes = await SceneService.getAllGlobalScenes();
    return NextResponse.json({
      success: true,
      data: scenes,
    }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scene = await SceneService.createGlobalScene(body);
    return NextResponse.json({
      success: true,
      data: scene,
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
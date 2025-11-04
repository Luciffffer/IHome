import { requireAuth } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { SceneService } from "@/services/SceneService";
import { NextRequest, NextResponse } from "next/server";

export interface PersonalScenePostBody {
  name: string;
  imageUrl?: string;
  description?: string;
  devices: string[];
}

export async function GET() {
  try {
    const session = await requireAuth();

    const userId = session!.user!.id!;

    const scenes = await SceneService.getScenesByUserId(userId);

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
    const session = await requireAuth();
    const userId = session!.user!.id!;
    const body = await request.json();
    const scene = await SceneService.createPersonalScene(body as PersonalScenePostBody, userId);
    return NextResponse.json({
      success: true,
      data: scene,
    }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
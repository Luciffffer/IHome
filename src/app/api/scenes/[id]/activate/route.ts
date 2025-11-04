import { requireAuth } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { IUser } from "@/models/User";
import { SceneService } from "@/services/SceneService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user: IUser | null = (await requireAuth(request))?.user as IUser || null;

    const { id } = await params;

    await SceneService.activateScene(id, user);

    return NextResponse.json({ success: true })
  } catch (error) {
    handleError(error);
  }
}
import { requireAuth } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { IUser } from "@/models/User";
import { SceneService } from "@/services/SceneService";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAuth();

        const { id } = await params;
        
        await SceneService.deleteScene(id, session!.user as IUser);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleError(error);
    }
}
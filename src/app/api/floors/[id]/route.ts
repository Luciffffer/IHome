import { requireAdmin } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { FloorService } from "@/services/FloorService";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();

        const { id } = await params;
        
        await FloorService.deleteFloor(id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleError(error);
    }
}

export async function PUT(
    request: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const floor = await FloorService.updateFloor(id, body);

    return NextResponse.json(
      { 
        success: 1,
        data: floor 
      }, { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
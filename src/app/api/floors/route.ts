import { requireAdmin, requireAuth } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { FloorService } from "@/services/FloorService";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        requireAuth();
        const floors = await FloorService.getFloors();

        return NextResponse.json(
            { 
                success: 1,
                data: floors 
            }, { status: 200 }
        );
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: Request) {
    try {
        requireAdmin();
        const body = await request.json();

        const { name } = body;

        const newFloor = await FloorService.createFloor(name);

        return NextResponse.json(
            { 
                success: 1,
                data: newFloor 
            }, { status: 201 }
        );
    } catch (error) {
        return handleError(error);
    }
}
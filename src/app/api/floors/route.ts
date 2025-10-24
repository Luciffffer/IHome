import { auth } from "@/auth";
import { requireAdmin } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { FloorService } from "@/services/FloorService";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { 
                    success: 0,
                    error: 'Unauthorized'
                }, { status: 401 }
            )
        }

        const floors = await FloorService.getFloors();

        return NextResponse.json(
            { 
                success: 1,
                data: floors 
            }, { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching floors:", error);
        return NextResponse.json(
            { 
                success: 0,
                error: 'Internal Server Error' 
            }, { status: 500 }
        );
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
        handleError(error);
    }
}
import { auth } from "@/auth";
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
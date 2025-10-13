import { auth } from "@/auth";
import { FloorService } from "@/services/FloorService";
import { NextResponse } from "next/server";
import z from "zod";

const createFloorSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
})

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
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { 
                    success: 0,
                    error: 'Unauthorized'
                }, { status: 401 }
            )
        }

        const body = await request.json();
        const parsed = createFloorSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: 0,
                    error: parsed.error.message
                }, { status: 400 }
            )
        }

        const { name } = parsed.data;

        const newFloor = await FloorService.createFloor(name);

        return NextResponse.json(
            { 
                success: 1,
                data: newFloor 
            }, { status: 201 }
        );
    } catch (error) {
        console.error("Error creating floor:", error);
        return NextResponse.json(
            { 
                success: 0,
                error: 'Internal Server Error' 
            }, { status: 500 }
        );
    }
}
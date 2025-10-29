import { requireAuth } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { DeviceService } from "@/services/DeviceService";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth();
    
    const { id } = await params;
    const body = await request.json();

    const updatedDevice = await DeviceService.updateDevice(
      id, body
    );

    return NextResponse.json(
      { 
        success: 1,
        data: updatedDevice 
      }, { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
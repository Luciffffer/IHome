import { requireAdmin, requireAuth } from "@/lib/auth-helpers";
import { handleError } from "@/lib/error-handler";
import { IDevice } from "@/models/Device";
import { DeviceService } from "@/services/DeviceService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    requireAuth();

    const searchParams = await request.nextUrl.searchParams;
    const floorId = searchParams.get('floorId');

    let devices: IDevice[] = [];

    if (!floorId) {
      devices = await DeviceService.getDevices();
    } else {
      devices = await DeviceService.getDevicesByFloorId(floorId);
    }

    return NextResponse.json(
      { 
        success: 1,
        data: devices 
      }, { status: 200 }
    );

  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin();
    const body = await request.json();

    const device = await DeviceService.createDevice(body);

    return NextResponse.json(
      { 
        success: 1,
        data: device
      }, { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
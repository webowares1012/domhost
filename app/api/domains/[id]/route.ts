import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Domain from "@/models/Domain";
import { getCurrentUser } from "@/lib/auth";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid domain ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const domain = await Domain.findById(id);

    if (!domain) {
      return NextResponse.json(
        {
          success: false,
          message: "Domain not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      domain,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch domain",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    await connectDB();

    const body = await req.json();

    const domain = await Domain.findByIdAndUpdate(
      id,
      {
        ...body,
        name: body.name?.toLowerCase().trim(),
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("registrar");

    if (!domain) {
      return NextResponse.json(
        {
          success: false,
          message: "Domain not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      domain,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update domain",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    await connectDB();

    const domain = await Domain.findByIdAndDelete(id);

    if (!domain) {
      return NextResponse.json(
        {
          success: false,
          message: "Domain not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Domain deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete domain",
      },
      { status: 500 },
    );
  }
}

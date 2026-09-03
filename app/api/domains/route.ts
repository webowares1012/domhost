import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Domain from "@/models/Domain";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Check logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // Connect MongoDB
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";

    const status = searchParams.get("status") || "";

    const category = searchParams.get("category") || "";

    const purchasedFrom = searchParams.get("purchasedFrom") || "";

    // Build MongoDB filter
    const filter: Record<string, any> = {};

    // Search
    if (search) {
      filter.$or = [
        {
          domainName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          purchasedFrom: {
            $regex: search,
            $options: "i",
          },
        },
        {
          notes: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Purchased From filter
    if (purchasedFrom && purchasedFrom !== "all") {
      filter.purchasedFrom = purchasedFrom;
    }

    // Fetch domains
    const domains = await Domain.find(filter)
      .sort({
        expiryDate: 1,
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: domains.length,
        domains,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("GET DOMAINS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch domains",
      },
      {
        status: 500,
      },
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    // Check logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // Connect MongoDB
    await connectDB();

    // Get request body
    const body = await req.json();

    console.log("Received domain data:", body);

    /*
     * Validate required fields
     */

    if (!body.domainName || !body.domainName.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Domain name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.purchasedFrom) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchased From is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.expiryDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Expiry date is required",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Normalize domain name
     */

    const domName = body.domainName.toLowerCase().trim();

    /*
     * Check if domain already exists
     */

    const existingDomain = await Domain.findOne({
      domainName: domName,
    });

    console.log("Existing domain:", existingDomain);

    if (existingDomain) {
      return NextResponse.json(
        {
          success: false,
          message: `Domain "${domName}" already exists`,
          existingDomain,
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Create domain
     */

    const domain = await Domain.create({
      domainName: domName,
      category: body.category,
      purchasedFrom: body.purchasedFrom,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
      expiryDate: new Date(body.expiryDate),
      status: body.status || "active",
      renewalCost: body.renewalCost !== undefined ? Number(body.renewalCost) : 0,
      currency: body.currency || "INR",
      autoRenew: Boolean(body.autoRenew),
      notes: body.notes?.trim() || "",
    });

    console.log("Domain created:", domain);

    return NextResponse.json(
      {
        success: true,
        message: "Domain saved successfully",
        domain,
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    console.error("CREATE DOMAIN ERROR:", error);

    /*
     * Duplicate domain
     */
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: `Domain ----- already exists`,
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Mongoose validation error
     */
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors || {}).map(
        (err: any) => err.message,
      );

      return NextResponse.json(
        {
          success: false,
          message: "Domain validation failed",
          errors: validationErrors,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Invalid date / cast error
     */
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid value for ${error.path}`,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save domain",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

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
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "";
    const purchasedFrom = searchParams.get("purchasedFrom") || "";
    const sortBy = searchParams.get("sortBy") || "created_desc";
    const expiryFilter = searchParams.get("expiryFilter") || "all";

    // Build MongoDB filter
    const filter: Record<string, any> = {};
    let sort: Record<string, 1 | -1> = { createdAt: -1, };

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

    // Pagination
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    // Total matching domains
    const totalDomains = await Domain.countDocuments(filter);

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    if (expiryFilter === "expired") {
      filter.expiryDate = {
        $lt: now,
      };
    }

    if (expiryFilter === "expiring_30") {
      filter.expiryDate = {
        $gte: now,
        $lte: thirtyDaysFromNow,
      };
    }

    if (expiryFilter === "after_30") {
      filter.expiryDate = {
        $gt: thirtyDaysFromNow,
      };
    }

    switch (sortBy) {
      case "created_asc":
        sort = {
          createdAt: 1,
        };
        break;

      case "created_desc":
        sort = {
          createdAt: -1,
        };
        break;

      case "name_asc":
        sort = {
          domainName: 1,
        };
        break;

      case "name_desc":
        sort = {
          domainName: -1,
        };
        break;

      case "expiry_asc":
        sort = {
          expiryDate: 1,
        };
        break;

      case "expiry_desc":
        sort = {
          expiryDate: -1,
        };
        break;

      default:
        sort = {
          createdAt: -1,
        };
    }



    // Fetch domains
    const domains = await Domain.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Pagination information
    const totalPages = Math.ceil(totalDomains / limit);

    return NextResponse.json({
      domains,
      pagination: {
        currentPage: page,
        limit,
        totalDomains,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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

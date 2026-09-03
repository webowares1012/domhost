import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Domain from "@/models/Domain";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    /*
     * Current date
     */
    const now = new Date();

    /*
     * Start of today
     *
     * This prevents time-of-day issues.
     */
    const startOfToday = new Date();

    startOfToday.setHours(0, 0, 0, 0);

    /*
     * Date 30 days from today
     */
    const thirtyDaysFromNow = new Date(startOfToday);

    thirtyDaysFromNow.setDate(
      thirtyDaysFromNow.getDate() + 30
    );

    /*
     * Total domains
     */
    const totalDomains = await Domain.countDocuments();

    /*
     * Active domains
     *
     * A domain is considered active when:
     *
     * expiryDate > 30 days from today
     */
    const activeDomains = await Domain.countDocuments({
      expiryDate: {
        $gt: thirtyDaysFromNow,
      },
    });

    /*
     * Expiring domains
     *
     * Expiry date is:
     *
     * today <= expiryDate <= 30 days
     */
    const expiringDomains = await Domain.countDocuments({
      expiryDate: {
        $gte: startOfToday,
        $lte: thirtyDaysFromNow,
      },
    });

    /*
     * Expired domains
     *
     * expiryDate < today
     */
    const expiredDomains = await Domain.countDocuments({
      expiryDate: {
        $lt: startOfToday,
      },
    });

    /*
     * Get domains expiring within next 30 days
     */
    const upcomingDomains = await Domain.find({
      expiryDate: {
        $gte: startOfToday,
        $lte: thirtyDaysFromNow,
      },
    })
      .sort({
        expiryDate: 1,
      })
      .lean();

    /*
     * Get all expired domains
     */
    const expiredDomainList = await Domain.find({
      expiryDate: {
        $lt: startOfToday,
      },
    })
      .sort({
        expiryDate: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,

      stats: {
        totalDomains,
        activeDomains,
        expiredDomains,
        expiringDomains,
      },

      upcomingDomains,

      expiredDomainsList: expiredDomainList,
    });
  } catch (error: any) {
    console.error("DASHBOARD STATS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}
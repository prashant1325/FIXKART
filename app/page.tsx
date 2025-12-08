import React, { Suspense } from "react";
import { prisma } from "@/lib/prisma"; // Make sure you have the prisma client helper
import InventoryContent from "@/components/InventoryContent";

// This is a Server Component. It runs on the backend.
export default async function HomePage() {
  
  // 1. Fetch any new products created via the Vendor Modal
  // We wrap this in try/catch to ensure the site still loads even if DB is down
  let dbProducts: any[] | undefined = [];
  try {
    dbProducts = await prisma.product.findMany({
      orderBy: { id: 'desc' }
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    // dbProducts remains [] so the site still works with static data
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Header Spacer (if you have a fixed header) */}
      <div className="w-full h-[70px]"></div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00529b]"></div>
          </div>
        }
      >
        {/* 2. Pass the DB data to the Client Component */}
        <InventoryContent dbProducts={dbProducts} />
      </Suspense>
    </div>
  );
}
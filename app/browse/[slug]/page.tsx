import React from "react";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

// --- CRITICAL FIX: Keep this line to prevent Build Errors ---
export const dynamic = "force-dynamic"; 

export default async function BrowseSubCategoryPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  const products = await prisma.product.findMany({
    where: {
      subCategory: {
        contains: slug, 
        mode: 'insensitive' 
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const groupedProducts: Record<string, typeof products> = {};
  
  products.forEach(product => {
    const type = product.subSubCategory || "Other Items";
    if (!groupedProducts[type]) groupedProducts[type] = [];
    groupedProducts[type].push(product);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-[#00529b]">← Back to Home</Link>
        <h1 className="text-3xl font-bold text-[#00529b] capitalize mt-2">
          {slug.replace(/-/g, ' ')} Inventory
        </h1>
      </div>

      <div className="max-w-7xl mx-auto">
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No products found in this category yet.</p>
            <p className="text-sm mt-2">Use the "Post Item" button on the homepage to add one.</p>
          </div>
        ) : (
          Object.entries(groupedProducts).map(([subType, items]) => (
            <section key={subType} className="mb-12">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#00529b] rounded-full"></span>
                {subType}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {items.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all relative group">
                    <DeleteButton productId={product.id} productName={product.name} />
                    <Link href={`/product/${product.slug}`} className="block">
                      <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                        <Image 
                          src={product.image || "https://placehold.co/400?text=No+Image"} 
                          alt={product.name} 
                          fill 
                          className="object-contain p-2"
                          unoptimized
                        />
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight min-h-[2.5em]">
                        {product.title || product.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[#00529b] font-bold text-sm">₹{product.price}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          Qty: {product.quantity}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
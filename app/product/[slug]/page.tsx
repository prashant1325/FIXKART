import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await params (Required in Next.js 15)
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 1. Fetch Product from DB
  const product = await prisma.product.findUnique({
    where: { slug: slug },
  });

  // 2. DEBUGGING: Check your VS Code terminal if you hit 404
  if (!product) {
    console.log(`❌ 404 Error: Could not find product with slug: "${slug}"`);
    return notFound();
  }

  // 3. Handle Specs Safely
  const specs = (product.specs as Record<string, string>) || {};

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#00529b] hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/browse/${product.subCategory}`} className="hover:text-[#00529b] hover:underline capitalize">
            {product.subCategory}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-bold text-gray-800 capitalize line-clamp-1">{product.title}</span>
        </nav>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-gray-50/50 p-8 flex items-center justify-center border-r border-gray-100">
            <div className="relative w-full max-w-md aspect-square bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <Image 
                 src={product.image || "https://placehold.co/600?text=No+Image"}
                 alt={product.title}
                 fill
                 className="object-contain p-4"
                 unoptimized
               />
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {product.subSubCategory || product.subCategory}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-[#00529b] mt-1">{product.title}</h1>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="text-3xl font-bold text-gray-900">₹{product.price.toFixed(2)}</div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${product.quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {product.quantity > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <div className="mb-8">
               <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Description</h3>
               <p className="text-gray-600 text-sm">{product.description}</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-auto">
              <button className="w-full bg-[#00529b] text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition-all">
                Contact Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { Suspense } from 'react'; 
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { INVENTORY_DATA, SIDEBAR_LINKS } from './data/inventory'; 
import { ProductItem } from './data/types';

// --- CONFIGURATION ---
const BRAND_BLUE = "#00529b";

// --- SUB-COMPONENT: HANDLES LOGIC ---
function InventoryContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || "";

  // Scroll Functionality
  const handleScroll = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Adjusted offset for mobile vs desktop (mobile header might need less/more offset)
      const headerOffset = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row">
      
      {/* ========================================= */}
      {/* 1. MOBILE CATEGORY NAV (Visible only on Mobile) */}
      {/* ========================================= */}
      <div className="md:hidden sticky top-[60px] z-40 bg-white border-b border-gray-200 shadow-sm w-full">
        <div className="flex overflow-x-auto whitespace-nowrap p-3 gap-2 hide-scrollbar">
          {SIDEBAR_LINKS.map((linkName, index) => {
             const catSlug = INVENTORY_DATA.find(c => c.title === linkName)?.slug || "";
             return (
               <a
                 key={index}
                 href={`#${catSlug}`}
                 onClick={(e) => handleScroll(e, catSlug)}
                 className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200 active:bg-[#00529b] active:text-white transition-colors"
               >
                 {linkName}
               </a>
             );
          })}
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. DESKTOP SIDEBAR (Hidden on Mobile)     */}
      {/* ========================================= */}
      <aside className="hidden md:block w-64 flex-shrink-0 py-4 pl-4 pr-6 border-r border-gray-200 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto">
        <h2 className="text-sm font-bold text-gray-800 border-b-2 border-[#ffc20e] pb-1 mb-3">
          Choose a Category
        </h2>
        <ul className="space-y-1 text-[13px] leading-tight text-gray-700">
          {SIDEBAR_LINKS.map((linkName, index) => {
            const catSlug = INVENTORY_DATA.find(c => c.title === linkName)?.slug || "";
            return (
              <li key={index}>
                <a 
                  href={`#${catSlug}`}
                  onClick={(e) => handleScroll(e, catSlug)}
                  className="block px-2 py-1 rounded transition-colors duration-150 hover:bg-gray-100 hover:text-[#00529b] cursor-pointer"
                >
                  {linkName}
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-6">
        
        {searchQuery && (
           <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
              Showing results for: <strong>"{searchQuery}"</strong>
              <a href="/" className="ml-4 text-blue-600 underline hover:no-underline">Clear Search</a>
           </div>
        )}

        {/* Loop through DATA from file */}
        {INVENTORY_DATA.map((category) => {
          
          const filteredItems = searchQuery 
              ? category.items.filter(item => item.name.toLowerCase().includes(searchQuery))
              : category.items;

          if (filteredItems.length === 0) return null;

          return (
            <section key={category.slug} id={category.slug} className="mb-12 scroll-mt-32 md:scroll-mt-24">
              <div className="border-b border-gray-300 pb-2 mb-6">
                <h1 className="text-xl md:text-2xl font-semibold" style={{ color: BRAND_BLUE }}>
                  {category.title}
                </h1>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8">
                {filteredItems.map((item, idx) => (
                  <ProductCard key={idx} item={item} />
                ))}
              </div>
            </section>
          );
        })}
        
        {searchQuery && document.querySelectorAll('section').length === 0 && (
           <div className="text-center py-20 text-gray-500">
              <h2 className="text-xl font-semibold">No products found</h2>
           </div>
        )}
      </main>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <div className="w-full h-auto"></div>
      
      <Suspense fallback={<div className="p-10 text-center">Loading Inventory...</div>}>
        <InventoryContent />
      </Suspense>
    </div>
  );
}

// --- PRODUCT CARD COMPONENT ---
function ProductCard({ item }: { item: ProductItem }) {
  const encodedName = encodeURIComponent(item.name);
  const fallbackUrl = `https://placehold.co/400x400/f3f4f6/00529b.png?text=${encodedName}&font=roboto`;
  const imageSource = item.imagePath ? item.imagePath : fallbackUrl;

  return (
    <div className="flex flex-col items-center group cursor-pointer w-full">
      <div className="aspect-square w-full max-w-[120px] bg-white border border-gray-200 rounded-md mb-2 flex items-center justify-center overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
        <Image 
            src={imageSource}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 hover:scale-105 transition-transform duration-200"
            unoptimized={true}
        />
      </div>
      <span className="text-[12px] text-center leading-tight text-gray-700 font-medium group-hover:underline group-hover:text-[#00529b] px-1 break-words w-full">
        {item.name}
      </span>
    </div>
  );
}
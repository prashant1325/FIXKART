"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react'; 
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { INVENTORY_DATA, SIDEBAR_LINKS } from './data/inventory'; 
import { ProductItem } from './data/types';

// --- CONFIGURATION ---
const BRAND_BLUE = "#00529b";
const HEADER_HEIGHT_OFFSET = 160; 
const STICKY_HEADER_TOP = "115px"; 

// --- UTILS ---
// Helper to create URL-friendly slugs (e.g., "Threaded Rods" -> "threaded-rods")
const toSlug = (text: string) =>
  text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

// --- ICONS ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 18 18" />
  </svg>
);

// --- SUB-COMPONENT: HANDLES LOGIC ---
function InventoryContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || "";
  
  // 1. STATE
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 2. PERFORMANCE: Memoize filtered data
  const filteredData = useMemo(() => {
    if (!searchQuery) return INVENTORY_DATA;
    return INVENTORY_DATA.map(category => {
      const matchingItems = category.items.filter(item => 
        item.name.toLowerCase().includes(searchQuery)
      );
      return { ...category, items: matchingItems };
    }).filter(category => category.items.length > 0);
  }, [searchQuery]);

  // 3. EFFECT: Intersection Observer
  useEffect(() => {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategorySlug(entry.target.id);
          }
        });
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [filteredData]);

  // 4. HANDLER: Smooth Scroll
  const handleScroll = useCallback((e: React.MouseEvent, id: string, closeMenu?: boolean) => {
    e.preventDefault();
    setActiveCategorySlug(id);
    if (closeMenu) setIsMobileMenuOpen(false);

    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - HEADER_HEIGHT_OFFSET;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <div className="w-full flex flex-col md:flex-row relative min-h-screen">
      
      {/* MOBILE BUTTON */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        suppressHydrationWarning={true}
        className="md:hidden fixed z-40 right-4 p-2 px-4 bg-[#00529b] text-white rounded-full shadow-lg hover:bg-blue-800 transition-all active:scale-95 flex items-center gap-2 border-2 border-white/20 backdrop-blur-sm"
        style={{ top: '120px' }} 
      >
        <MenuIcon />
      </button>

      {/* MOBILE DRAWER */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div 
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-[#00529b]">All Categories</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-500">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
           <ul className="space-y-1">
            {SIDEBAR_LINKS.map((linkName, index) => {
                const catSlug = INVENTORY_DATA.find(c => c.title === linkName)?.slug || "";
                const existsInView = filteredData.some(c => c.slug === catSlug);
                const isActive = activeCategorySlug === catSlug;

                if (!existsInView && searchQuery) return null;

                return (
                <li key={index}>
                    <a 
                    href={`#${catSlug}`}
                    onClick={(e) => handleScroll(e, catSlug, true)} 
                    className={`
                        block px-3 py-3 rounded-lg text-sm transition-all duration-200 font-medium
                        ${isActive 
                            ? "bg-blue-50 text-[#00529b] border-l-4 border-[#00529b]" 
                            : "text-gray-600 hover:bg-gray-50"
                        }
                    `}
                    >
                    {linkName}
                    </a>
                </li>
                );
            })}
           </ul>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 flex-shrink-0 py-6 pl-6 pr-4 border-r border-gray-200 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto custom-scrollbar">
        <h2 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-4">
          Browse Categories
        </h2>
        <ul className="space-y-1 text-[13px] leading-tight text-gray-700">
          {SIDEBAR_LINKS.map((linkName, index) => {
            const catSlug = INVENTORY_DATA.find(c => c.title === linkName)?.slug || "";
            const existsInView = filteredData.some(c => c.slug === catSlug);
            const isActive = activeCategorySlug === catSlug;

            if (!existsInView && searchQuery) return null;

            return (
              <li key={index}>
                <a 
                  href={`#${catSlug}`}
                  onClick={(e) => handleScroll(e, catSlug)}
                  className={`
                    block px-3 py-2 rounded-md transition-all duration-200 cursor-pointer select-none
                    ${isActive 
                        ? "bg-[#e6f0fa] text-[#00529b] font-bold" 
                        : "hover:bg-gray-100 hover:text-[#00529b]"
                    }
                  `}
                >
                  {linkName}
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-8 min-h-screen bg-gray-50/30">
        
        {searchQuery && (
           <div className="mb-8 p-4 bg-white border border-yellow-200 rounded-lg shadow-sm text-sm text-gray-700 animate-fade-in flex items-center justify-between">
             <span>Results for: <strong>"{searchQuery}"</strong></span>
             <a href="/" className="text-blue-600 text-xs font-bold uppercase tracking-wide hover:underline">Clear</a>
           </div>
        )}

        {filteredData.map((category) => (
            <section 
                key={category.slug} 
                id={category.slug} 
                className="mb-10 scroll-mt-48 md:scroll-mt-24"
            >
              {/* SECTION HEADER */}
              <div 
                className="sticky z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:border-none"
                style={{ top: STICKY_HEADER_TOP }} 
              >
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#00529b] rounded-full inline-block"></span>
                  {category.title}
                </h1>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8">
                {category.items.map((item, idx) => (
                  <ProductCard 
                    key={`${category.slug}-${idx}`} 
                    item={item} 
                    categorySlug={category.slug} 
                  />
                ))}
              </div>
            </section>
        ))}
        
        {searchQuery && filteredData.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <span className="text-4xl mb-4">🔍</span>
             <h2 className="text-lg font-semibold text-gray-600">No products found</h2>
           </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <div className="w-full h-auto"></div> 
      <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">Loading...</div>}>
        <InventoryContent />
      </Suspense>
    </div>
  );
}

// --- UPDATED PRODUCT CARD ---
const ProductCard = React.memo(function ProductCard({ item, categorySlug }: { item: ProductItem, categorySlug: string }) {
  const encodedName = encodeURIComponent(item.name);
  
  // 1. Determine Primary and Fallback URLs
  // Clean up paths: change backslashes to forward slashes. 
  // If it doesn't start with '/', add it (unless it's http/https).
  let primaryPath = item.imagePath ? item.imagePath.replace(/\\/g, "/") : "";
  if (primaryPath && !primaryPath.startsWith('/') && !primaryPath.startsWith('http')) {
    primaryPath = '/' + primaryPath;
  }

  const fallbackUrl = `https://placehold.co/400x400/f3f4f6/00529b.png?text=${encodedName}&font=roboto`;
  
  // 2. Local State for the Image Source
  // We default to the primary path (from inventory data).
  // If that fails (onError), we switch to fallbackUrl.
  const [imgSrc, setImgSrc] = useState(primaryPath || fallbackUrl);

  // If the item prop changes, reset the image source to try the new primary path
  useEffect(() => {
    setImgSrc(primaryPath || fallbackUrl);
  }, [primaryPath, fallbackUrl]);

  const itemSlug = toSlug(item.name);

  // --- LOGIC: AVAILABILITY CHECK ---
  const quantity = (item as any).quantity || 0; 
  const isAvailable = quantity > 0;

  const containerClasses = `flex flex-col items-center group w-full h-full bg-white rounded-lg p-2 transition-all hover:bg-white cursor-pointer`;

  return (
    <Link href={`/${categorySlug}/${itemSlug}`} className={containerClasses}>
      <div className={`aspect-square w-full max-w-[120px] bg-white border border-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative shadow-sm transition-all duration-300 ${
        isAvailable ? 'group-hover:shadow-md group-hover:border-blue-100' : ''
      }`}>
        <Image 
            src={imgSrc} // Use state variable here
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-contain p-2 transition-transform duration-300 ${
              isAvailable ? 'group-hover:scale-105' : 'opacity-80 grayscale-[0.3]'
            }`}
            unoptimized={true}
            loading="lazy"
            onError={() => setImgSrc(fallbackUrl)} // Switch to placeholder on error
        />
        
        {/* COMING SOON BADGE (Only shows if quantity is 0) */}
        {!isAvailable && (
          <div className="absolute top-1 right-1 z-10">
             <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-200 tracking-tight shadow-sm">
                Coming Soon
             </span>
          </div>
        )}
      </div>
      <span className={`text-[13px] text-center leading-snug font-medium px-1 line-clamp-2 ${
        isAvailable ? 'text-gray-600 group-hover:text-[#00529b]' : 'text-gray-400 group-hover:text-gray-600'
      }`}>
        {item.name}
      </span>
    </Link>
  );
});
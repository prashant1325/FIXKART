// src/data/types.ts
export interface ProductItem {
  name: string;
  imagePath?: string; // Optional: specific path to image in /public
}

export interface Category {
  title: string;
  slug: string; // url-safe ID (e.g., 'hand-tools')
  items: ProductItem[];
}


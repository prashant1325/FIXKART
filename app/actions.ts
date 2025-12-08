"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

// --- 1. ADD PRODUCT ACTION ---
export async function addProduct(formData: FormData) {
  // A. Get Basic Info
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const quantity = parseInt(formData.get("quantity") as string) || 10; // Capture quantity
  
  // B. Get Hierarchy (Level 1, 2, 3)
  const category = formData.get("category") as string;
  const subCategory = formData.get("subCategory") as string;
  const subSubCategory = formData.get("subSubCategory") as string;

  // C. Get Inventory Details
  const sku = formData.get("sku") as string;
  const size = formData.get("size") as string; 
  
  // D. Handle Image File
  const file = formData.get("imageFile") as File;
  let finalImagePath = (formData.get("imageUrl") as string) || "";

  // If a file was uploaded, save it locally to public/uploads
  if (file && file.size > 0) {
    const filename = Date.now() + "_" + file.name.replace(/\s+/g, "_");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);
    finalImagePath = `/uploads/${filename}`;
  }

  // E. Validate Required Fields
  if (!name || !category || !subCategory || !price) {
    throw new Error("Missing required fields (Name, Category, Sub-Category, or Price)");
  }

  // F. Save to Database
  await prisma.product.create({
    data: {
      name,
      title,
      description: description || "",
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      
      // Hierarchy
      category,
      subCategory,
      subSubCategory: subSubCategory || "", 

      // Image
      image: finalImagePath,
      imagePath: finalImagePath,

      // Price & Stock
      price: price,
      quantity: quantity, // Use the captured quantity
      sku: sku || undefined,
      brand: "Generic",

      // Hardware Specs
      specs: {
        size: size || sku || "Standard", 
      },

      isPublished: true,
    },
  });

  revalidatePath("/");
  return { success: true };
}

// --- 2. DELETE PRODUCT ACTION ---
export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete:", error);
    return { success: false, error: "Failed to delete" };
  }
}

// --- 3. GET DYNAMIC SUGGESTIONS (NEW) ---
// This allows the frontend to ask "What Sub-Sub-Categories exist for 'Anchors'?"
export async function getExistingSubSubCategories(subCategory: string) {
  if (!subCategory) return [];

  try {
    const results = await prisma.product.findMany({
      where: {
        subCategory: subCategory,
        subSubCategory: { not: "" }, // Ensure we don't get empty strings
      },
      select: {
        subSubCategory: true,
      },
      distinct: ["subSubCategory"], // Only return unique values
    });

    // Extract the names into a simple array
    return results
      .map((r) => r.subSubCategory)
      .filter((val): val is string => !!val); // Type guard to ensure strings
      
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return [];
  }
}
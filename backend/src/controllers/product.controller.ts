import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Product from "../models/Product";
import Vendor from "../models/Vendor";
import mongoose from "mongoose";

// Helper: resilient vendor lookup that supports Clerk user ids and ObjectIds
const findVendorByAuthUser = async (authUser: any) => {
  const clerkUserId =
    authUser?.userId || authUser?.id || authUser?.sub || authUser;
  if (!clerkUserId) return null;

  // 1) direct match (user stored as string)
  let v = await Vendor.findOne({ user: clerkUserId });
  if (v) return v;

  // 2) try clerk-specific field (if vendor documents store clerk id)
  v = await Vendor.findOne({ clerkId: clerkUserId });
  if (v) return v;

  console.log("Chl raha hai");
  // 3) try as ObjectId
  if (mongoose.Types.ObjectId.isValid(clerkUserId)) {
    try {
      v = await Vendor.findOne({
        user: new mongoose.Types.ObjectId(clerkUserId),
      });
      if (v) return v;
    } catch (e) {
      // ignore
    }
  }

  return null;
};

// @access  Private (Vendor)
export const createProduct = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    // console.log(
    //   "Create Product Request Body:",
    //   JSON.stringify(req.body, null, 2)
    // );
    // Get vendor profile using resilient lookup (supports Clerk user id)
    const clerkUserId =
      (req as any).user?.userId ||
      (req as any).user?.id ||
      (req as any).user?.sub;

    // const vendor = (req as any).user;
    // const vendor = await findVendorByAuthUser((req as any).user);

    // if (!vendor) {
    //   console.log("Vendor profile not found for clerk user:", clerkUserId);
    //   res.status(403).json({
    //     message: "Vendor profile not found. Please complete onboarding.",
    //   });
    //   return;
    // }

    const {
      name,
      description,
      category,
      brand,
      price,
      stock,
      minOrderQuantity,
      unit,
      specifications,
    } = req.body;

    const product = new Product({
      vendor: clerkUserId,
      name,
      description,
      category,
      brand,
      sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      price,
      stock,
      minOrderQuantity,
      unit,
      specifications,
    });

    await product.save();
    console.log("Product saved successfully:", product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    res
      .status(500)
      .json({ message: "Server error", error: (error as any).message });
  }
};

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      status,
      scope,
    } = req.query;
    const { role, userId } = (req as any).user || {}; // Optional user for public access

    let query: any = {};

    // if (scope === "vendor" && role === "vendor") {
    //   const vendor = await findVendorByAuthUser(userId);
    //   if (vendor) {
    //     query.vendor = vendor._id;
    //     // Vendor can see all their products regardless of status
    //     if (status) query.status = status;
    //   }
    // } else if (role !== "admin") {
    //   query.status = "active";
    //   query.isActive = true;
    // } else if (status) {
    //   // Admin can filter by status
    //   query.status = status;
    // }

    // if (keyword) {
    //   query.$text = { $search: keyword as string };
    // }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate("vendor", "businessName rating")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "businessName rating address"
    );
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error("Get product by ID error:", error);
    // Log the full error object for debugging
    console.error(JSON.stringify(error, null, 2));
    res
      .status(500)
      .json({ message: "Server error", error: (error as any).message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const vendor = await findVendorByAuthUser((req as any).user);
    if (!vendor) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Check ownership
    if (product.vendor.toString() !== vendor._id.toString()) {
      res
        .status(401)
        .json({ message: "Not authorized to update this product" });
      return;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const vendor = await findVendorByAuthUser((req as any).user);
    if (!vendor) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Check ownership
    if (product.vendor.toString() !== vendor._id.toString()) {
      res
        .status(401)
        .json({ message: "Not authorized to delete this product" });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update product status (Admin only)
// @route   PUT /api/products/:id/status
// @access  Private (Admin)
export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["pending", "active", "rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error("Update product status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  vendor: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  minOrderQuantity: number;
  unit: string;
  images: string[];
  specifications: Array<{
    key: string;
    value: string;
  }>;
  status: "pending" | "active" | "rejected";
  isActive: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    vendor: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    sku: { type: String, unique: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, required: true, min: 0 },
    minOrderQuantity: { type: Number, default: 1 },
    unit: { type: String, required: true }, // e.g., "piece", "box", "kg"
    images: [{ type: String }],
    specifications: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for search
ProductSchema.index({ name: "text", description: "text", category: "text" });

export default mongoose.model<IProduct>("Product", ProductSchema);

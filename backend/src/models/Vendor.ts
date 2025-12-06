import mongoose, { Schema, Document } from "mongoose";

export interface IVendor extends Document {
  user: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  gstNumber: string;
  panNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  documents: {
    gstCertificate: string;
    panCard: string;
    cancelledCheque: string;
  };
  isVerified: boolean;
  status: "pending" | "approved" | "rejected";
  rating: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    gstNumber: { type: String, required: true, unique: true },
    panNumber: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    bankDetails: {
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
      accountHolderName: { type: String, required: true },
    },
    documents: {
      gstCertificate: { type: String },
      panCard: { type: String },
      cancelledCheque: { type: String },
    },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>("Vendor", VendorSchema);

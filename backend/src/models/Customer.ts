import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  gstNumber?: string;
  creditLimit: number;
  creditUsed: number;
  paymentTerms: string; // e.g., "Net 30", "Prepaid"
  shippingAddresses: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true },
    gstNumber: { type: String },
    creditLimit: { type: Number, default: 0 },
    creditUsed: { type: Number, default: 0 },
    paymentTerms: { type: String, default: "Prepaid" },
    shippingAddresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: "India" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>("Customer", CustomerSchema);

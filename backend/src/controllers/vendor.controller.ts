import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Vendor from "../models/Vendor";
import User from "../models/User";

export const registerVendor = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    // Check if vendor profile already exists for this user
    let vendor = await Vendor.findOne({ user: (req as any).user!.userId });
    if (vendor) {
      res.status(400).json({ message: "Vendor profile already exists" });
      return;
    }

    const {
      businessName,
      businessType,
      gstNumber,
      panNumber,
      address,
      bankDetails,
    } = req.body;

    // Create new vendor profile
    vendor = new Vendor({
      user: (req as any).user!.userId,
      businessName,
      businessType,
      gstNumber,
      panNumber,
      address,
      bankDetails,
      status: "pending", // Default status
    });

    await vendor.save();

    // Update user role to 'vendor' if not already (though they should have registered as vendor)
    await User.findByIdAndUpdate((req as any).user!.userId, { role: "vendor" });

    res
      .status(201)
      .json({ message: "Vendor profile created successfully", vendor });
  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorProfile = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findOne({ user: (req as any).user!.userId });
    if (!vendor) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }
    res.json(vendor);
  } catch (error) {
    console.error("Get vendor profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVendorProfile = async (req: Request, res: Response) => {
  try {
    const { businessName, address, bankDetails } = req.body;

    // Build update object
    const updateFields: any = {};
    if (businessName) updateFields.businessName = businessName;
    if (address) updateFields.address = address;
    if (bankDetails) updateFields.bankDetails = bankDetails;

    const vendor = await Vendor.findOneAndUpdate(
      { user: (req as any).user!.userId },
      { $set: updateFields },
      { new: true }
    );

    if (!vendor) {
      res.status(404).json({ message: "Vendor profile not found" });
      return;
    }

    res.json(vendor);
  } catch (error) {
    console.error("Update vendor profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

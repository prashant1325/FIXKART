import { Router } from "express";
import { check } from "express-validator";
import { authenticate, authorize } from "../middleware/auth";
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
} from "../controllers/vendor.controller";

const router = Router();

// @route   POST /api/vendors/onboard
// @desc    Create vendor profile (onboarding)
// @access  Private (Vendor only)
router.post(
  "/onboard",
  authenticate,
  authorize(["vendor"]),
  [
    check("businessName", "Business name is required").not().isEmpty(),
    check("businessType", "Business type is required").not().isEmpty(),
    check("gstNumber", "GST Number is required").not().isEmpty(),
    check("panNumber", "PAN Number is required").not().isEmpty(),
    check("address.street", "Street address is required").not().isEmpty(),
    check("address.city", "City is required").not().isEmpty(),
    check("address.state", "State is required").not().isEmpty(),
    check("address.zipCode", "Zip code is required").not().isEmpty(),
    check("bankDetails.accountNumber", "Account number is required")
      .not()
      .isEmpty(),
    check("bankDetails.ifscCode", "IFSC code is required").not().isEmpty(),
    check("bankDetails.bankName", "Bank name is required").not().isEmpty(),
    check("bankDetails.accountHolderName", "Account holder name is required")
      .not()
      .isEmpty(),
  ],
  registerVendor
);

// @route   GET /api/vendors/me
// @desc    Get current vendor profile
// @access  Private (Vendor only)
router.get("/me", authenticate, authorize(["vendor"]), getVendorProfile);

// @route   PUT /api/vendors/me
// @desc    Update vendor profile
// @access  Private (Vendor only)
router.put("/me", authenticate, authorize(["vendor"]), updateVendorProfile);

export default router;

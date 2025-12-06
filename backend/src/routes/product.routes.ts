import { Router } from "express";
import { check } from "express-validator";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../middleware/auth";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "../controllers/product.controller";

const router = Router();

// Public routes
router.get("/", optionalAuthenticate, getProducts);
router.get("/:id", getProductById);

// Protected routes (Vendor only)
router.post(
  "/",
  authenticate,
  // authorize(["vendor"]),
  // [
  //   check("name", "Name is required").not().isEmpty(),
  //   check("description", "Description is required").not().isEmpty(),
  //   check("category", "Category is required").not().isEmpty(),
  //   check("price", "Price is required").isNumeric(),
  //   check("stock", "Stock is required").isNumeric(),
  //   check("unit", "Unit is required").not().isEmpty(),
  // ],
  createProduct
);

router.put("/:id", authenticate, authorize(["vendor"]), updateProduct);
router.delete("/:id", authenticate, authorize(["vendor"]), deleteProduct);

// Admin routes
router.put(
  "/:id/status",
  authenticate,
  authorize(["admin"]),
  updateProductStatus
);

export default router;

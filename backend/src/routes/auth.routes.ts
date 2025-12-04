import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();

const registerValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["vendor", "customer", "salesperson", "delivery_partner"])
    .withMessage("Invalid role"),
  body("mobile").isMobilePhone("en-IN").withMessage("Invalid mobile number"),
];

router.post("/register", registerValidation, register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.get("/me", authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

export default router;

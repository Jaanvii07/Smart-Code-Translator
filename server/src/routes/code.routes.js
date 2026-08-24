import { Router } from "express";
import {
  translate,
  analyze,
  optimize,
  explain,
} from "../controllers/code.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import syntaxCheckMiddleware from "../middleware/syntaxCheck.middleware.js";

const router=Router();

router.use(authenticate);
router.use(syntaxCheckMiddleware);

router.post("/translate" , translate);
router.post("/analyze", analyze);
router.post("/optimize", optimize);
router.post("/explain", explain);

export default router;
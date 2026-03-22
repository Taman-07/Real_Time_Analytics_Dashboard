import express from "express";
import { getAnalytics, addAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", getAnalytics);
router.post("/", addAnalytics);

export default router;
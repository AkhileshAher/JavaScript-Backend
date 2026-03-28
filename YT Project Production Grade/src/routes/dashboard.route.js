import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
      getChannelStats,
      getChannelVideos,
} from "../controllers/dashboard.controller.js";

const router = Router();


router.get("/me/stats", verifyJWT, getChannelStats);
router.get("/me/videos", verifyJWT, getChannelVideos);


export default router;

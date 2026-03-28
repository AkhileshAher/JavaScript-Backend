import { Router } from "express";
import {
      getSubscribedChannels,
      getUserChannelSubscribers,
      toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.patch("/:channelId", verifyJWT, toggleSubscription);

router.get("/channel/:channelId", getUserChannelSubscribers);

router.get("/me/:subscriberId", verifyJWT, getSubscribedChannels);

export default router;
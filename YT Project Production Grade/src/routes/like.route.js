import { Router } from "express";
import {
      getLikedVideos,
      toggleCommentLike,
      toggleTweetLike,
      toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

router.get("/me/liked-videos", verifyJWT, getLikedVideos);
router.patch("/:videoId/like-video", verifyJWT, toggleVideoLike);
router.patch("/:commentId/like-comment", verifyJWT, toggleCommentLike);
router.patch("/:tweetId/like-tweet", verifyJWT, toggleTweetLike);


export default router;

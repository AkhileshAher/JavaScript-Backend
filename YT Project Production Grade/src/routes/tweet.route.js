import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createTweet);

router.get("/", getUserTweets);

router.patch("/:tweetId", verifyJWT, updateTweet);

router.delete("/:tweetId", verifyJWT, deleteTweet);



export default router;
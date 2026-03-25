import { Tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validObjectIdCheck } from "../utils/ObjectIdValidator.js";

const createTweet = asyncHandler(async (req, res) => {
      const { content } = req.body;

      if (!content || content.trim() === "") {
            throw new ApiError(400, "Content is Mandatory For Tweet");
      }

      const tweet = await Tweet.create({
            content,
            owner: req.user._id,
      });

      return res
            .status(201)
            .json(new ApiResponse(201, tweet, "Tweet Created Success"));
});

const getUserTweets = asyncHandler(async (req, res) => {
      const { userId } = req.params;

      validObjectIdCheck(userId, 400, "Invalid User Id");

      const allTweets = await Tweet.find({
            owner: userId,
      });

      if (!allTweets) {
            throw new ApiError(400, "No Tweets Yet");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(200, allTweets, "All tweets Fetched Success")
            );
});

const updateTweet = asyncHandler(async (req, res) => {
      const { tweetId } = req.params;
      const { content } = req.body;

      validObjectIdCheck(tweetId, 400, "Invalid tweet ID");

      if (!content || content.trim() === "") {
            throw new ApiError(400, "Content is Required");
      }

      const tweet = await Tweet.findOneAndUpdate(
            {
                  _id: tweetId,
                  owner: req.user._id,
            },
            {
                  $set: {
                        content,
                  },
            },
            { returnDocument: "after" }
      );

      if (!tweet) {
            throw new ApiError(400, "Tweet not Found or Unauthorized Access");
      }

      return res
            .status(200)
            .json(new ApiResponse(200, tweet, "Tweet Updated Success"));
});

const deleteTweet = asyncHandler(async (req, res) => {
      const { tweetId } = req.params;

      validObjectIdCheck(tweetId, 400, "Invalid Tweet ID");

      const tweet = await Tweet.findOneAndDelete({
            _id: tweetId,
            owner: req.user._id,
      });

      if (!tweet) {
            throw new ApiError(400, "Invalid Tweet ID");
      }

      return res
            .status(200)
            .json(new ApiResponse(200, tweet, "Tweet Deleted Success"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

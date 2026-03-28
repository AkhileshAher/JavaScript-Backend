import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validObjectIdCheck } from "../utils/ObjectIdValidator.js";

const toggleLike = async ({ field, value, userId }) => {
      const existing = await Like.findOne({
            [field]: value,
            likedBy: userId,
      });

      if (existing) {
            await existing.deleteOne();
            return false;
      }

      await Like.create({
            [field]: value,
            likedBy: userId,
      });

      return true;
};

const toggleVideoLike = asyncHandler(async (req, res) => {
      const { videoId } = req.params;

      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const liked = await toggleLike({
            field: "video",
            value: videoId,
            userId: req.user._id,
      });

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        { liked },
                        liked
                              ? "Video liked successfully"
                              : "Video unliked successfully"
                  )
            );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
      const { commentId } = req.params;

      validObjectIdCheck(commentId, 400, "Invalid Comment ID");

      const liked = await toggleLike({
            field: "comment",
            value: commentId,
            userId: req.user._id,
      });

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        { liked },
                        liked
                              ? "Comment liked successfully"
                              : "Comment unliked successfully"
                  )
            );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
      const { tweetId } = req.params;

      validObjectIdCheck(tweetId, 400, "Invalid Tweet ID");

      const liked = await toggleLike({
            field: "tweet",
            value: tweetId,
            userId: req.user._id,
      });

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        { liked },
                        liked
                              ? "Tweet liked successfully"
                              : "Tweet unliked successfully"
                  )
            );
});

const getLikedVideos = asyncHandler(async (req, res) => {
      

      const likedVideos = await Like.aggregate([
            {
                  $match: {
                        likedBy: req.user._id,
                        video: { $ne: null }, // only video likes
                  },
            },
            {
                  $lookup: {
                        from: "videos",
                        localField: "video",
                        foreignField: "_id",
                        as: "likedVideo",
                  },
            },
            {
                  $unwind: {
                        path: "$likedVideo",
                        preserveNullAndEmptyArrays: false,
                  },
            },
            {
                  $match: {
                        "likedVideo.isPublished": true,
                  },
            },
            {
                  $project: {
                        _id: 0,
                        video: "$likedVideo._id",
                        videoFile: "$likedVideo.videoFile",
                        thumbnail: "$likedVideo.thumbnail",
                        owner: "$likedVideo.owner",
                        title: "$likedVideo.title",
                        description: "$likedVideo.description",
                        views: "$likedVideo.views",
                        duration: "$likedVideo.duration",
                  },
            },
            { $sort: { createdAt: -1 } },
      ]);

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        likedVideos,
                        "Liked videos fetched successfully"
                  )
            );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };

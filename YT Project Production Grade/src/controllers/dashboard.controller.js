import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/videos.model.js";
import { Subscription } from "../models/subscription.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
      const userId = new mongoose.Types.ObjectId(req.user?._id);

      const videoStats = await Video.aggregate([
            {
                  $match: {
                        owner: userId,
                        isPublished: true,
                  },
            },
            {
                  $lookup: {
                        from: "likes",
                        localField: "_id",
                        foreignField: "video",
                        as: "Channellikes",
                  },
            },
            {
                  $group: {
                        _id: null,
                        totalVideos: { $sum: 1 },
                        totalViews: { $sum: "$views" },
                        totalLikes: {
                              $sum: { $size: { $ifNull: ["$likes", []] } },
                        },
                  },
            },
      ]);

      const totalSubscribers = await Subscription.countDocuments({
            channel: userId,
      });

      const finalResult = {
            totalVideos: videoStats[0]?.totalVideos || 0,
            totalViews: videoStats[0]?.totalViews || 0,
            totalLikes: videoStats[0]?.totalLikes || 0,
            totalSubscribers,
      };

      return res
            .status(200)
            .json(new ApiResponse(200, finalResult, "Stats Fetched Success"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
      const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);
      // console.log(ownerObjectId);

      if (!mongoose.Types.ObjectId.isValid(ownerObjectId)) {
            throw new ApiError(400, "Id is Not Appropriate");
      };

      const result = await Video.aggregate([
            {
                  $match: {
                        owner: ownerObjectId,
                  },
            },
      ]);

      return res
            .status(200)
            .json(new ApiResponse(200, result, "Channel videos Fetched"));
});

export { getChannelStats, getChannelVideos };

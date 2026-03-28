import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/videos.model.js";
import { Subscription } from "../models/subscription.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
      const userId = new mongoose.Types.ObjectId(req.user?._id);

      const [videoStats, totalSubscribers] = await Promise.all([
            Video.aggregate([
                  {
                        $match: {
                              owner: userId,
                              isPublished: true,
                        },
                  },
                  {
                        $lookup: {
                              from: "likes",
                              let: { videoId: "$_id" },
                              pipeline: [
                                    {
                                          $match: {
                                                $expr: {
                                                      $eq: [
                                                            "$video",
                                                            "$$videoId",
                                                      ],
                                                },
                                          },
                                    },
                                    { $count: "count" },
                              ],
                              as: "channelLikes",
                        },
                  },
                  {
                        $addFields: {
                              likeCount: {
                                    $ifNull: [
                                          {
                                                $arrayElemAt: [
                                                      "$channelLikes.count",
                                                      0,
                                                ],
                                          },
                                          0,
                                    ],
                              },
                        },
                  },
                  {
                        $group: {
                              _id: null,
                              totalVideos: { $sum: 1 },
                              totalViews: { $sum: "$views" },
                              totalLikes: { $sum: "$likeCount" },
                        },
                  },
            ]),
            Subscription.countDocuments({ channel: userId }),
      ]);

      const stats = videoStats[0] || {};

      const finalResult = {
            totalVideos: stats.totalVideos || 0,
            totalViews: stats.totalViews || 0,
            totalLikes: stats.totalLikes || 0,
            totalSubscribers,
      };

      return res
            .status(200)
            .json(new ApiResponse(200, finalResult, "Stats Fetched Success"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
      const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);

      const result = await Video.aggregate([
            {
                  $match: {
                        owner: ownerObjectId,
                        isPublished: true,
                  },
            },
      ]);

      return res
            .status(200)
            .json(new ApiResponse(200, result, "Channel videos Fetched"));
});

export { getChannelStats, getChannelVideos };

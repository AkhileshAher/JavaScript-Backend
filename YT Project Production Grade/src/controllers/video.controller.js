import mongoose from "mongoose";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Video } from "../models/videos.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
      const {
            page = 1,
            limit = 10,
            query,
            sortBy = "createdAt",
            sortType = "desc",
            userId,
      } = req.query;

      // check for query empty other
      // Check for Specific user query
      // sort filters

      if (!query || query.trim() === "") {
            throw new ApiError(400, "Search query is required");
      }

      // Match Stage
      const matchStage = {
            isPublished: true,
            $text: { $search: query },
      };

      // Optional Filter by User
      if (userId) {
            matchStage.owner = new mongoose.Types.ObjectId(userId);
      }

      const aggregate = Video.aggregate([
            {
                  $match: matchStage,
            },
            {
                  $addFields: {
                        score: {
                              $meta: "textScore",
                        },
                  },
            },
            {
                  $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "ownerDetails",
                  },
            },
            {
                  $unwind: "$ownerDetails",
            },
            {
                  $project: {
                        videoFile: 1,
                        thumbnail: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        views: 1,
                        createdAt: 1,
                        score: 1,
                        "ownerDetails._id": 1,
                        "ownerDetails.username": 1,
                        "ownerDetails.avatar": 1,
                  },
            },
            {
                  $sort: {
                        score: -1,
                        [sortBy]: sortType === "asc" ? 1 : -1,
                  },
            },
      ]);

      // Pagination Options
      const options = {
            page: Number(page),
            limit: Number(limit),
      };

      const result = await Video.aggregatePaginate(aggregate, options);

      return res
            .status(200)
            .json(new ApiResponse(200, result, "Video Fetched Success"));
});

const publishAVideo = asyncHandler(async (req, res) => {
      const { title, description } = req.body;

      const videoFilePath = req.files?.video?.[0].path;
      const thumbnailPath = req.files?.thumbnail?.[0].path;

      if (!videoFilePath) {
            throw new ApiError(404, "Video File is Required");
      }

      if (!thumbnailPath) {
            throw new ApiError(404, "Thumbnail is Required");
      }

      const video = await uploadOnCloudinary(videoFilePath);
      const thumbnail = await uploadOnCloudinary(thumbnailPath);

      if (!video) {
            throw new ApiError(404, "Video File is Missing");
      }
      if (!thumbnail) {
            throw new ApiError(404, "Thumbnail is Missing");
      }

      //console.log(video);

      const videoData = await Video.create({
            videoFile: video.url,
            thumbnail: thumbnail.url,
            owner: req.user._id,
            title,
            description,
            duration: video.duration,
            views: 0,
            isPublished: true,
      });

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        videoData,
                        "Video Published SuccessFully"
                  )
            );
});

const getVideoById = asyncHandler(async (req, res) => {
      const { videoId } = req.params;

      if (!videoId) {
            throw new ApiError(404, "videoId is Required");
      }

      const video = await Video.findById(videoId);

      if (!video) {
            throw new ApiError(404, "No Video Found");
      }

      return res
            .status(200)
            .json(new ApiResponse(200, video, "Video Search Success"));
});

const updateVideo = asyncHandler(async (req, res) => {
      const { videoId } = req.params;
      const { title, description } = req.body;

      if (!(title || description)) {
            throw new ApiError(404, "All Fields are Required");
      }

      const video = await Video.findById(videoId);

      if (!video) {
            throw new ApiError(404, "Video not found");
      }

      const user = await User.findById(video.owner).select(
            "-password -refreshToken"
      );

      if (user._id.toString() != req.user._id.toString()) {
            throw new ApiError(401, "Unauthorized Access");
      }

      const thumbnailFilePath = req.file?.path;

      let thumbnailFile;
      if (thumbnailFilePath) {
            thumbnailFile = await uploadOnCloudinary(thumbnailFilePath);
      }

      const videoData = await Video.findByIdAndUpdate(
            videoId,
            {
                  $set: {
                        thumbnail: thumbnailFile?.url || video.thumbnail,
                        title,
                        description,
                  },
            },
            {
                  returnDocument: "after",
            }
      );

      return res
            .status(200)
            .json(
                  new ApiResponse(200, videoData, "Video Updated Successfully")
            );
});

const deleteVideo = asyncHandler(async (req, res) => {
      const { videoId } = req.params;

      if (!videoId) {
            throw new ApiError(404, "VideoId is Required");
      }

      const video = await Video.findById(videoId);

      if (!video) {
            throw new ApiError(408, "No Video Exist with this videoId");
      }

      if (video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(404, "You dont have Access to delete the Video");
      }

      const videoDelete = await Video.findByIdAndDelete(videoId, {
            returnDocument: "after",
      });

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        videoDelete,
                        "Video Deleted Successfully"
                  )
            );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
      const { videoId } = req.params;

      const video = await Video.findById(videoId);

      if (!video) {
            throw new ApiError(402, "No video Exist with this Id");
      }

      if (video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(
                  405,
                  "You dont have Access to edit this Video Settings"
            );
      }

      const isPublished = !video.isPublished;

      const videoToggle = await Video.findByIdAndUpdate(
            videoId,
            {
                  $set: {
                        isPublished,
                  },
            },
            {
                  returnDocument: "after",
            }
      );

      return res
            .status(200)
            .json(new ApiResponse(200, videoToggle, "Toggled Success"));
});

export {
      getAllVideos,
      publishAVideo,
      getVideoById,
      updateVideo,
      deleteVideo,
      togglePublishStatus,
};

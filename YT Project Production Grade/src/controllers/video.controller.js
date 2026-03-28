import mongoose from "mongoose";
import { Video } from "../models/videos.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { validObjectIdCheck } from "../utils/ObjectIdValidator.js";

const getAllVideos = asyncHandler(async (req, res) => {
      const {
            page = 1,
            limit = 10,
            query = "",
            sortBy = "createdAt",
            sortType = "desc",
            userId,
      } = req.query;


      if (userId) {
            validObjectIdCheck(userId, 400, "Invalid User ID");
            matchStage.owner = userId;
      }

      let matchStage = {};
      if (query.trim() || userId) {
            matchStage = {
                  isPublished: true,
                  $text: { $search: query },
            };
      }


      matchStage.owner = new mongoose.Types.ObjectId(userId);

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
                  $unwind: {
                        path: "$ownerDetails",
                        preserveNullAndEmptyArrays: true,
                  },
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

      if ((title && !title.trim()) || (description && !description.trim())) {
            throw new ApiError(400, "Fields cannot be empty");
      }

      const videoFilePath = req.files?.video?.[0].path;
      const thumbnailPath = req.files?.thumbnail?.[0].path;

      if (!videoFilePath) {
            throw new ApiError(400, "Video File is Required");
      }

      if (!thumbnailPath) {
            throw new ApiError(400, "Thumbnail is Required");
      }

      const video = await uploadOnCloudinary(videoFilePath);
      const thumbnail = await uploadOnCloudinary(thumbnailPath);

      if (!video) {
            throw new ApiError(400, "Video File is Missing");
      }
      if (!thumbnail) {
            throw new ApiError(400, "Thumbnail is Missing");
      }


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
            .status(201)
            .json(
                  new ApiResponse(
                        201,
                        videoData,
                        "Video Published SuccessFully"
                  )
            );
});

const getVideoById = asyncHandler(async (req, res) => {
      const { videoId } = req.params;

      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const video = await Video.findById(videoId);

      if (!video) {
            throw new ApiError(400, "No Video Found");
      }

      return res
            .status(200)
            .json(new ApiResponse(200, video, "Video Search Success"));
});

const updateVideo = asyncHandler(async (req, res) => {
      const { videoId } = req.params;
      const { title, description } = req.body;

      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      if (!(title || description)) {
            throw new ApiError(400, "All Fields are Required");
      }

      const thumbnailFilePath = req.file?.path;

      let thumbnailFile = "";
      if (thumbnailFilePath) {
            thumbnailFile = await uploadOnCloudinary(thumbnailFilePath);
      }

      const updateData = {
            title,
            description,
      };

      if (thumbnailFile?.url) {
            updateData.thumbnail = thumbnailFile.url;
      }

      const videoData = await Video.findOneAndUpdate(
            {
                  _id: videoId,
                  owner: req.user._id,
            },
            updateData,
            {
                  returnDocument: "after",
            }
      );

      if (!videoData) {
            throw new ApiError(400, "No Video Found or Unaithorized Access");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(200, videoData, "Video Updated Successfully")
            );
});

const deleteVideo = asyncHandler(async (req, res) => {
      const { videoId } = req.params;

      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const videoDelete = await Video.findOneAndDelete({
            _id: videoId,
            owner: req.user._id,
      });

      if (!videoDelete) {
            throw new ApiError(404, "Video not found or unauthorized");
      }

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

      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const video = await Video.findById(videoId);

      if (!video) {
            throw new ApiError(402, "No video Exist with this Id");
      }

      if (video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(
                  403,
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

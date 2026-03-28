import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validObjectIdCheck } from "../utils/ObjectIdValidator.js";
import { Video } from "../models/videos.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
      const { videoId } = req.params;
      let { page = 1, limit = 10 } = req.query;

      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const videoExists = await Video.exists({ _id: videoId });

      if (!videoExists) {
            throw new ApiError(404, "Video not found");
      }

      const objectVideoId = new mongoose.Types.ObjectId(videoId);

      const result = Comment.aggregate([
            {
                  $match: {
                        video: objectVideoId,
                  },
            },
            {
                  $sort: { createdAt: -1 },
            },
            {
                  $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                  },
            },
            {
                  $unwind: {
                        path: "$owner",
                        preserveNullAndEmptyArrays: true,
                  },
            },
            {
                  $project: {
                        content: 1,
                        createdAt: 1,
                        "owner._id": 1,
                        "owner.username": 1,
                        "owner.avatar": 1,
                  },
            },
      ]);

      const options = {
            page: parseInt(page),
            limit: parseInt(limit),
      };

      const comments = await Comment.aggregatePaginate(result, options);

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        comments,
                        "Comments Fetched Successfully"
                  )
            );
});

const addComment = asyncHandler(async (req, res) => {
      const { videoId } = req.params;
      const { content } = req.body;

      if (!content || content.trim() === "") {
            throw new ApiError(400, "Content is Required and cannot be empty");
      }

      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const videoExists = await Video.findById(videoId);
      if (!videoExists) {
            throw new ApiError(404, "Video not found");
      }

      const comment = await Comment.create({
            content: content.trim(),
            video: videoId,
            owner: req.user?._id,
      });

      return res
            .status(201)
            .json(new ApiResponse(201, comment, "Comment Success"));
});

const updateComment = asyncHandler(async (req, res) => {
      const { commentId, videoId } = req.params;
      const { content } = req.body;

      if (!content || content.trim() === "") {
            throw new ApiError(400, "Content is Required and cannot be empty");
      }

      validObjectIdCheck(commentId, 400, "Invalid Comment ID");
      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const commentData = await Comment.findOneAndUpdate(
            {
                  _id: commentId,
                  owner: req.user?._id,
                  video: videoId,
            },
            {
                  $set: {
                        content: content.trim(),
                  },
            },
            { new: true }
      );

      if (!commentData) {
            throw new ApiError(404, "Comment not found or unauthorized");
      }

      return res
            .status(200)
            .json(new ApiResponse(200, commentData, "Comment Updated Success"));
});

const deleteComment = asyncHandler(async (req, res) => {
      const { videoId, commentId } = req.params;

      validObjectIdCheck(videoId, 400, "Invalid Video ID");
      validObjectIdCheck(commentId, 400, "Invalid Comment ID");

      const deletedComment = await Comment.findOneAndDelete({
            _id: commentId,
            video: videoId,
            owner: req.user?._id,
      });

      if (!deletedComment) {
            throw new ApiError(404, "Comment not found or unauthorized");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        deletedComment,
                        "Comment Deleted Success"
                  )
            );
});

export { addComment, updateComment, deleteComment, getVideoComments };

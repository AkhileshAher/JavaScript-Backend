import { Playlist } from "../models/playlists.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/videos.model.js";
import mongoose from "mongoose";
import { validObjectIdCheck } from "../utils/ObjectIdValidator.js";

const createPlaylist = asyncHandler(async (req, res) => {
      const { name, description } = req.body;

      if (
            !name ||
            !description ||
            name.trim() === "" ||
            description.trim() === ""
      ) {
            throw new ApiError(400, "All fields are required");
      }

      const playlist = await Playlist.create({
            name,
            description,
            videos: [],
            owner: req.user._id,
      });

      return res
            .status(201)
            .json(
                  new ApiResponse(
                        201,
                        playlist,
                        "Playlist created successfully"
                  )
            );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
      const { userId } = req.params;

      validObjectIdCheck(userId, 400, "Invalid User ID");

      const playlists = await Playlist.find({ owner: userId });

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        playlists,
                        "Playlists fetched successfully"
                  )
            );
});

const getPlaylistById = asyncHandler(async (req, res) => {
      const { playlistId } = req.params;

      validObjectIdCheck(playlistId, 400, "Invalid Playlist ID");

      const objectPlaylistId = new mongoose.Types.ObjectId(playlistId);

      const result = await Playlist.aggregate([
            {
                  $match: { _id: objectPlaylistId },
            },
            {
                  $lookup: {
                        from: "videos",
                        localField: "videos",
                        foreignField: "_id",
                        as: "videos",
                  },
            },
      ]);

      if (!result.length) {
            throw new ApiError(404, "Playlist not found");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        result[0],
                        "Playlist fetched successfully"
                  )
            );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
      const { playlistId, videoId } = req.params;

      validObjectIdCheck(playlistId, 400, "Invalid Playlist ID");
      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const video = await Video.findById(videoId);

      if (!video) {
            throw new ApiError(404, "Video not found");
      }

      const playlist = await Playlist.findOneAndUpdate(
            { _id: playlistId, owner: req.user._id },
            {
                  $addToSet: { videos: videoId },
            },
            { returnDocument: "after" }
      );

      if (!playlist) {
            throw new ApiError(404, "Playlist not found or unauthorized");
      }

      return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
      const { playlistId, videoId } = req.params;

      validObjectIdCheck(playlistId, 400, "Invalid Playlist ID");
      validObjectIdCheck(videoId, 400, "Invalid Video ID");

      const videoExists = await Video.exists({ _id: videoId });
      if (!videoExists) {
            throw new ApiError(404, "Video not found");
      }

      const playlist = await Playlist.findOneAndUpdate(
            { _id: playlistId, owner: req.user._id },
            {
                  $pull: { videos: videoId },
            },
            { returnDocument: "after" }
      );

      if (!playlist) {
            throw new ApiError(404, "Playlist not found or unauthorized");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(200, playlist, "Video removed from playlist")
            );
});

const deletePlaylist = asyncHandler(async (req, res) => {
      const { playlistId } = req.params;

      validObjectIdCheck(playlistId, 400, "Invalid Playlist ID");

      const playlist = await Playlist.findOneAndDelete({
            _id: playlistId,
            owner: req.user._id,
      });

      if (!playlist) {
            throw new ApiError(404, "Playlist not found or unauthorized");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        playlist,
                        "Playlist deleted successfully"
                  )
            );
});

const updatePlaylist = asyncHandler(async (req, res) => {
      const { playlistId } = req.params;
      const { name, description } = req.body;

      validObjectIdCheck(playlistId, 400, "Invalid Playlist ID");

      if ([name, description].some((field) => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
      }

      const playlist = await Playlist.findOneAndUpdate(
            {
                  _id: playlistId,
                  owner: req.user._id,
            },
            {
                  $set: { name, description },
            },
            { returnDocument: "after" }
      );

      if (!playlist) {
            throw new ApiError(404, "Playlist not found or unauthorized");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        playlist,
                        "Playlist updated successfully"
                  )
            );
});

export {
      createPlaylist,
      getUserPlaylists,
      getPlaylistById,
      addVideoToPlaylist,
      removeVideoFromPlaylist,
      deletePlaylist,
      updatePlaylist,
};

import { Playlist } from "../models/playlists.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/videos.model.js";
import mongoose from "mongoose";

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

      if (!userId || userId.trim() === "") {
            throw new ApiError(400, "UserId is required");
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID");
      }

      const playlists = await Playlist.find({ owner: userId });

      if (!playlists.length) {
            throw new ApiError(404, "No playlists found");
      }

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

      if (!playlistId || playlistId.trim() === "") {
            throw new ApiError(400, "PlaylistId is required");
      }

      if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
      }

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

      if (
            !playlistId ||
            !videoId ||
            playlistId.trim() === "" ||
            videoId.trim() === ""
      ) {
            throw new ApiError(400, "PlaylistId and VideoId are required");
      }

      if (
            !mongoose.Types.ObjectId.isValid(playlistId) ||
            !mongoose.Types.ObjectId.isValid(videoId)
      ) {
            throw new ApiError(400, "Invalid playlist or video ID");
      }

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

      if (
            !playlistId ||
            !videoId ||
            playlistId.trim() === "" ||
            videoId.trim() === ""
      ) {
            throw new ApiError(400, "PlaylistId and VideoId are required");
      }

      if (
            !mongoose.Types.ObjectId.isValid(playlistId) ||
            !mongoose.Types.ObjectId.isValid(videoId)
      ) {
            throw new ApiError(400, "Invalid playlist or video ID");
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

      if (!playlistId || playlistId.trim() === "") {
            throw new ApiError(400, "PlaylistId is required");
      }

      if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
      }

      const playlist = await Playlist.findOneAndDelete({
            _id: playlistId,
            owner: req.user._id,
      });

      if (!playlist) {
            throw new ApiError(404, "Playlist not found or unauthorized");
      }

      return res
            .status(200)
            .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
      const { playlistId } = req.params;
      const { name, description } = req.body;

      if (
            [playlistId, name, description].some(
                  (field) => !field || field.trim() === ""
            )
      ) {
            throw new ApiError(400, "All fields are required");
      }

      if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
      }

      const playlist = await Playlist.findOneAndUpdate(
            { _id: playlistId, owner: req.user._id },
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

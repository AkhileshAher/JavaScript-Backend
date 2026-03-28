import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
      addVideoToPlaylist,
      createPlaylist,
      deletePlaylist,
      getPlaylistById,
      getUserPlaylists,
      removeVideoFromPlaylist,
      updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.post("/", verifyJWT, createPlaylist);

router.get("/:userId", verifyJWT, getUserPlaylists);

router.get("/:playlistId", getPlaylistById);

router.patch("/:playlistId", verifyJWT, updatePlaylist);

router.delete("/:playlistId", verifyJWT, deletePlaylist);

router.post("/:playlistId/videos/:videoId", verifyJWT, addVideoToPlaylist);

router.delete(
      "/:playlistId/videos/:videoId",
      verifyJWT,
      removeVideoFromPlaylist
);

export default router;

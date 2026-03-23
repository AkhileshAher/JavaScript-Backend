import { Router } from "express";
import {
      deleteVideo,
      getAllVideos,
      getVideoById,
      publishAVideo,
      togglePublishStatus,
      updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router({ mergeParams: true });

router.route("/search").get(verifyJWT, getAllVideos);

router.route("/publish").post(
      verifyJWT,
      upload.fields([
            {
                  name: "video",
                  maxCount: 1,
            },
            {
                  name: "thumbnail",
                  maxCount: 1,
            },
      ]),
      publishAVideo
);

router.route("/:videoId")
      .get(verifyJWT, getVideoById)
      .patch(verifyJWT, upload.single("thumbnail"), updateVideo)
      .delete(verifyJWT, deleteVideo);

router.route("/toggle/:videoId").get(verifyJWT, togglePublishStatus);

export default router;

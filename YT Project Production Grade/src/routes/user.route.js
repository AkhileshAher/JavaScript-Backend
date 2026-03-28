import { Router } from "express";
import {
      changeCurrentPassword,
      getCurrentUser,
      getUserChannelProfile,
      getWatchHistory,
      loginUser,
      logoutUser,
      refreshAccessToken,
      registerUser,
      updateAccountDetails,
      updateUserAvatar,
      updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

// Public
router.post(
      "/register",
      upload.fields([
            { name: "avatar", maxCount: 1 },
            { name: "coverImage", maxCount: 1 },
      ]),
      registerUser
);

router.post("/login", loginUser);
router.get("/refresh-token", refreshAccessToken);

// Protected
router.post("/logout", verifyJWT, logoutUser);

router.route("/me")
      .get(verifyJWT, getCurrentUser)
      .patch(verifyJWT, updateAccountDetails);

router.patch("/me/password", verifyJWT, changeCurrentPassword);

router.patch(
      "/me/avatar",
      verifyJWT,
      upload.single("avatar"),
      updateUserAvatar
);

router.patch(
      "/me/cover-image",
      verifyJWT,
      upload.single("coverImage"),
      updateUserCoverImage
);

router.get("/me/history", verifyJWT, getWatchHistory);

// Public profile
router.get("/c/:username", getUserChannelProfile);


export default router;
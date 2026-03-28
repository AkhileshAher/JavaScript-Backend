import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
      addComment,
      deleteComment,
      getVideoComments,
      updateComment,
} from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true });

router.route("/:videoId/comments")
      .get(getVideoComments)
      .post(verifyJWT, addComment);

router.route("/:videoId/comments/:commentId")
      .patch(verifyJWT, updateComment)
      .delete(verifyJWT, deleteComment);

export default router;

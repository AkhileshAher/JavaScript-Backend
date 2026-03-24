import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
      {
            comment: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Comment",
            },
            video: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Video",
            },
            likedBy: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
            },
            tweet: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Tweet",
            },
      },
      { timestamps: true }
);

likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true });

export const Likes = mongoose.model("Likes", likeSchema);

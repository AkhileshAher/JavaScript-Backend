import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const usersSchema = new mongoose.Schema(
      {
            username: {
                  type: String,
                  required: true,
                  unique: true,
                  lowercase: true,
                  trim: true,
                  index: true,
            },
            email: {
                  type: String,
                  required: true,
                  unique: true,
                  lowercase: true,
                  trim: true,
            },
            fullName: {
                  type: String,
                  required: true,
                  trim: true,
                  index: true,
            },
            avatar: {
                  type: String,
            },
            coverImage: {
                  type: String,
            },
            password: {
                  type: String,
                  required: [true, "Password is Required"],
            },
            refreshToken: {
                  type: String,
            },
            watchHistory: [
                  {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Video",
                  },
            ],
      },
      { timestamps: true }
);

usersSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next;
      this.password = await bcrypt.hash(this.password, 10);
      next;
});

usersSchema.methods.isPasswordCorrect = async function (password) {
      return await bcrypt.compare(password, this.password);
};

usersSchema.methods.generateAccessToken = function () {
      return jwt.sign(
            {
                  _id: this._id,
                  email: this.email,
                  username: this.username,
                  fullName: this.fullName,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                  expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
      );
};

usersSchema.methods.generateRefreshToken = function () {
      return jwt.sign(
            {
                  _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                  expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
      );
};

export const User = mongoose.model("User", usersSchema);

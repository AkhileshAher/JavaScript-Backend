import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validObjectIdCheck } from "../utils/ObjectIdValidator.js";

const toggleSubscription = asyncHandler(async (req, res) => {
      const { channelId } = req.params;

      validObjectIdCheck(channelId, 400, "Invalid Channel ID");

      if (channelId === req.user._id.toString()) {
            throw new ApiError(400, "You Cannot Subscribe to Yourself");
      }

      const deleted = await Subscription.findOneAndDelete({
            subscriber: req.user._id,
            channel: channelId,
      });

      if (deleted) {
            return res
                  .status(200)
                  .json(new ApiResponse(200, {}, "Unsubscribed"));
      }

      await Subscription.create({
            subscriber: req.user._id,
            channel: channelId,
      });

      return res.status(200).json(new ApiResponse(200, {}, "Subscribed"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
      const { channelId } = req.params;

      validObjectIdCheck(channelId, 400, "Invalid Channel ID");

      const channelidObject = new mongoose.Types.ObjectId(channelId);

      const userChannelSubscribers = await Subscription.aggregate([
            {
                  $match: {
                        channel: channelidObject,
                  },
            },
      ]);

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        userChannelSubscribers,
                        "Channels Subscribers Fetched Success"
                  )
            );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
      const { subscriberId } = req.params;

      validObjectIdCheck(subscriberId, 400, "Invalid Subscriber ID");

      const filterSubsciberId = new mongoose.Types.ObjectId(subscriberId);

      const result = await Subscription.aggregate([
            {
                  $match: {
                        subscriber: filterSubsciberId,
                  },
            },
            {
                  $lookup: {
                        from: "users",
                        localField: "channel",
                        foreignField: "_id",
                        as: "channelInfo",
                  },
            },
            {
                  $unwind: "$channelInfo",
            },
            {
                  $project: {
                        _id: 0,
                        channel: 1,
                        "channelInfo.username": 1,
                        "channelInfo.email": 1,
                        "channelInfo.fullName": 1,
                        "channelInfo.avatar": 1,
                        "channelInfo.coverImage": 1,
                  },
            },
      ]);

      if (!result) {
            throw new ApiError(400, "No Subscribed Channels Yet");
      }

      return res
            .status(200)
            .json(
                  new ApiResponse(
                        200,
                        result,
                        "Subscribed Channels fetched Success"
                  )
            );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

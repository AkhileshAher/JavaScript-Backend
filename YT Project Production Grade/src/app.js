import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes Import
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import subscriberRouter from "./routes/subscriber.route.js";
import tweetsRouter from "./routes/tweet.route.js";
import playlistRouter from "./routes/playlist.route.js";

const app = express();

app.use(
      cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
      })
);

app.use(express.json());

app.use(
      express.urlencoded({
            extended: true,
      })
);

app.use(express.static("public"));
app.use(cookieParser());

// routes declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/videos", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriberRouter);
app.use("/api/v1/tweets", tweetsRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app };

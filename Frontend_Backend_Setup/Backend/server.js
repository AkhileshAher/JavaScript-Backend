import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.get("/", (req, res) => {
  res.send("Server is Ready and Serving");
});

app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "A Joke",
      content: "This is a Joke",
    },
    {
      id: 2,
      title: "Another Joke",
      content: "This is a Another Joke",
    },
    {
      id: 3,
      title: "A Third Joke",
      content: "This is Third a Joke",
    },
    {
      id: 4,
      title: "A Fourth Joke",
      content: "This is a Fourth Joke",
    },
    {
      id: 5,
      title: "A 5 Joke",
      content: "This is a Fifth Joke",
    },
    {
      id: 6,
      title: "A  6 Joke",
      content: "This is a Sixth Joke",
    },
  ];

  res.send(jokes);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Listening on Port  : ${process.env.PORT}`);
});

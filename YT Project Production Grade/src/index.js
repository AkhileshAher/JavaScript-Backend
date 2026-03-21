import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import dotenv from 'dotenv';
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDb()
.then(() => {
    app.listen(process.env.PORT || 8000 ,() => {
        console.log("Server is Listening on PORT ",process.env.PORT || 8000);
    });
})
.catch((err)=>{
    console.log("MONGO DB Connection Failed !!! ",err);
});





// Approach 1

// import express from "express";
// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERROR :", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on PORT ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("ERROR :", error);
//   }
// })();

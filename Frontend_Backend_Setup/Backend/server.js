import express from 'express';

const app = express();

app.listen(process.env.PORT ,() => {
    console.log(`Server is Listening to PORT : ${process.env.PORT}`);
});
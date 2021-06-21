import dotenv from "dotenv"; //using imports as I have set "type" : "module" in package.json()
dotenv.config();

import express from "express";
import mongoose from "mongoose";
const app = express();

import cors from 'cors';

import userRoutes from "./routes/user.js";
import changeRoutes from "./routes/change.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());


app.use("/user", userRoutes); //all user auth routes come to this endpoint
app.use("/change", changeRoutes); //all change auth routes come to this endpoint

app.use("/", (req, res) => {
  res.status(404).json({ message: "404 error" });
});


import {createServer} from "http";
import {Server} from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer);

io.on('connection',(socket)=>{
  console.log("connected");
})



mongoose
  .connect(process.env.dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server Running at 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });

mongoose.set("useFindAndModify", false);

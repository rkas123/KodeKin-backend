import express from "express";
import {auth} from "../middlewares/auth.js";
const router = express.Router();

import {
    addFriend,
    addResource,
    deletefriend,
    editFriend,
    getFriends,
} from "../controllers/change.js";

router.patch("/addresource",auth, addResource);
router.patch("/addfriend",auth,addFriend);
router.get("/getfriends",auth,getFriends);
router.patch("/deletefriend",auth,deletefriend);
router.patch("/editfriend",auth,editFriend);
export default router;
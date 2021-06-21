import express from "express";

const router = express.Router();

import {
  signIn,
  signUp,
  signOut,
  confirmMail,
  changePassword,
  resetPassword,
} from "../controllers/user.js";

router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/signout", signOut);
router.get("/confirm/:token", confirmMail);
router.post("/changepassword", changePassword);
router.get("/resetpassword/:token", resetPassword);

export default router;

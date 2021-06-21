import dotenv from "dotenv"; //using imports as I have set "type" : "module" in package.json()
dotenv.config();

import crypto from "crypto";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";

const tranpsorter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

//signin route works when a previously logged in user tries to sign in again




export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email }); //only existing users can sign in
    if (!existingUser) {
      return res.status(401).json({ message: "User Doesnt't Exist" });
    }

    if (!existingUser.emailConfirmed)
      return res.status(401).json({ message: "Email Not Confirmed" });

    const isPasswordCorrect = await bcrypt.compare(
      //comparing passwords
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      //signing the token
      { email: email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: token,name: existingUser.username }); //returning the token to client who will store it in local storage
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Login Failed" });
  }
};








// creating a new user in the DB, we will signin again after confirming the email
export const signUp = async (req, res) => {
  const { email, password, username } = req.body;
  console.log(email, password, username);
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      //already signed up
      return res.status(401).json({ message: "Email Already Exists" });

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = await new User({
      //creating  new user model object
      email: email,
      username: username,
      password: hashPassword,
      emailConfirmed: false,
      friends: [],
    });

    await newUser.save(); //storing in database

    const token = jwt.sign(
      //signing token for email confirmation
      { email: email, id: newUser._id },
      process.env.EMAIL_SECRET,
      { expiresIn: "1d" }
    );

    let url; //url for email body
    if (process.env.PORT) {
      url = `${process.env.PORT}/user/confirm/${token}`;
    } else {
      url = `http://localhost:5000/user/confirm/${token}`;
    }

    tranpsorter
      .sendMail({
        //sending email using nodemailer
        to: email, //returning to catch errors in catch block
        from: "codeforcesfriends@gmail.com",
        subject: "Email Confirmation",
        html: `Please click on the link to confirm you email address. <a href="${url}">Click Here</a>`,
      })
      .then((response) => console.log(response))
      .catch((err) => console.log(err));

    res.status(200).json({ message: "Confirm Email" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Something went wrong" });
  }
};





export const signOut = async (req, res) => {
  //Just added this controller.
  //Technically we just neet to remove the token on the frontend from the cookie or localstorage
};






export const confirmMail = async (req, res) => {
  try {
    const userData = jwt.verify(req.params.token, process.env.EMAIL_SECRET); //decoding the jwt token

    await User.updateOne(
      //if the user exists, then confirm your email
      { _id: userData.id },
      { $set: { emailConfirmed: true } }
    );
    // res.status(200).json({ message: "Email Confirmed" });
    res.redirect("http://localhost:3000/login");

    //NOTE: here we need to redirect to a new url or the sign up page.
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Email Confirmation Failed" });

    //NOTE: here we need to redirect to a new page
  }
};






export const changePassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ message: "SignUp first" });
  }
  if (!user.emailConfirmed) {
    return res.status(401).json({ message: "Email not confirmed" });
  }
  //Generating random token from inbuilt nodejs library
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ message: "Password Change Failed" });
    } else {
      const token = buffer.toString("hex");
      try {
        //finding user with specified email and updating the token and token expiry date

        user.passwordChangeToken = token;
        user.passwordChangeTokenDate = Date.now() + 3600000;
        user.newPasswordField = await bcrypt.hash(password, 12);
        await user.save();

        //sending an password change email to the user

        let url = `http://localhost:5000/user/resetpassword/${token}`;
        if (process.env.PORT) {
          url = `${process.env.PORT}/user/resetpassword/${token}`;
        }
        tranpsorter
          .sendMail({
            //sending email using nodemailer
            to: email,
            from: "codeforcesfriends@gmail.com",
            subject: "Password Change Mail",
            html: `Please click on the link to confirm you email address. <a href="${url}">Click Here</a>`,
          })
          .then((response) => console.log(response))
          .catch((err) => console.log(err));
        res.status(200).json({ message: "Confirm Email" });
      } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Something went wrong" });
      }
    }
  });
};







export const resetPassword = async (req, res) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({
      passwordChangeToken: token,
      passwordChangeTokenDate: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid Token" });
      //Here we need to redirect to sign in page
    }
    //password change confirmed
    user.password = user.newPasswordField;
    user.newPasswordField = null;
    user.passwordChangeToken = null;
    user.passwordChangeTokenDate = null;
    await user.save();
    //Now User can login with new password
    //redirect to sign in page
    res.status(200).json({ message: "Password Change successful. Now SignIn" });
  } catch (error) {
    console.log(err);
    res.status(401).json({ message: "Something went wrong" });
  }
};

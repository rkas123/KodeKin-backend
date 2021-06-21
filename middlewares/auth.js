import jwt from "jsonwebtoken";
import User from '../models/user.js';

const secret = process.env.JWT_SECRET;

export const auth = async (req, res, next) => {
  try {
    if(!req.headers.authorization)
    {
      throw err;
    }
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
      const decodedData = jwt.verify(token, secret);
      const user = await User.findOne({_id: decodedData.id});
      if(!user)
        throw err;
      req.userId = decodedData.id;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({type:"1", message: "Authorization Failed"});
  }
};

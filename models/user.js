import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  emailConfirmed: { type: Boolean, default: false },
  passwordChangeToken: { type: String },
  passwordChangeTokenDate: { type: Date },
  newPasswordField: { type: String },
  friends: [
    {
      name: String,
      resources: [
        {
          platform: String,
          link: String,
        }
      ]
    }
  ],
});

export default mongoose.model("User", userSchema);

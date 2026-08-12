import mongoose, { Schema } from "mongoose";

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const UserModel = mongoose.model<User>("User", userSchema);

import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },
  role: { type: String, enum: ['admin', 'user', 'pending_admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
})

const User = models.User || model('User', UserSchema);

export default User;
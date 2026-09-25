import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    purchasedTiers: {
      type: [String],
      default: [],
    },
    completedPhases: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Method to safely return user object without password
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    purchasedTiers: this.purchasedTiers,
    completedPhases: this.completedPhases || [],
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;

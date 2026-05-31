import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: "admin" | "parent" | "teacher" | "supervisor";
  classes?: mongoose.Types.ObjectId[];
  subjects?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true,
      match: [/^\+?[\d\s-()]+$/, "Please provide a valid phone number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["admin", "parent", "teacher", "supervisor"],
      default: "parent",
    },
    classes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Exclude password from JSON responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model<IUser>("User", userSchema);

export { User };

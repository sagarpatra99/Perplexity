import { success } from "zod";
import userModel from "../models/user.model.js";

export const controllerRegister = async (req, res) => {
  try {
    const { username, email, password } = req.validatedData;

    // Check if user already exists
    const existingUser = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .lean();

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email or username already exists",
        success: false,
        err: "User already exists",
      });
    }

    // Create new user
    const user = await userModel.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      message: "User created successfully!",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error); // 🔥 important
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const controllerLogin = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Find user by email
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    if (!user.verified) {
      return res.status(401).json({
        message: "Please verify your email before login!",
        success: false,
      });
    }

    // TODO: Generate JWT token here

    res.status(200).json({
      message: "Login successful!",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

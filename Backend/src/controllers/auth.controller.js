import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

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

    await sendEmail({
  to: email,
  subject: "Welcome to Perplexity 🚀",
  html: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden;">

      <!-- Header -->
      <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Perplexity</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hi ${username}, 👋</h2>

        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Welcome to <strong>Perplexity</strong>! We're excited to have you on board.
        </p>

        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          You can now explore the platform and start using all features.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" 
             style="background-color: #4f46e5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Get Started
          </a>
        </div>

        <p style="color: #999; font-size: 14px;">
          If you didn’t create this account, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f4f6f8; text-align: center; padding: 15px; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} Perplexity. All rights reserved.
      </div>

    </div>
  </div>
  `,
});

    res.status(201).json({
      message: "User registered successfully!",
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

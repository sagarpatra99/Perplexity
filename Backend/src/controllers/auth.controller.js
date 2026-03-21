import { success } from "zod";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

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

    // ✅ Generate email verification token
    const emailVerificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // ✅ Create verify URL (frontend)
    const verifyUrl = `http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}`;

    // ✅ Send verification email (don't break flow if email fails)
    try {
      await sendEmail({
        to: email,
        subject: "Verify your email - Perplexity 🚀",
        html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial;">

          <div style="max-width:600px; margin:30px auto; background:#fff; border-radius:8px; overflow:hidden;">

            <div style="background:#4f46e5; padding:20px; text-align:center; color:white;">
              <h1 style="margin:0;">Perplexity</h1>
            </div>

            <div style="padding:30px;">
              <h2>Hi ${username}, 👋</h2>

              <p style="color:#555;">
                Thanks for signing up! Please verify your email to activate your account.
              </p>

              <div style="text-align:center; margin:30px 0;">
                <a href="${verifyUrl}" 
                   style="background:#4f46e5; color:white; padding:12px 24px; 
                          text-decoration:none; border-radius:6px; font-weight:bold;">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; color:#777;">
                Or copy this link:
              </p>

              <p style="font-size:13px; word-break:break-all; color:#4f46e5;">
                ${verifyUrl}
              </p>

              <p style="font-size:13px; color:#999;">
                This link expires in 24 hours.
              </p>
            </div>

            <div style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#888;">
              © ${new Date().getFullYear()} Perplexity
            </div>

          </div>

        </body>
        </html>
        `,
      });
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError);
      // ❗ Don't fail registration if email fails
    }

    // ✅ Response
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error); // 🔥 important
    res.status(500).json({
      success: false,
      error: {
        code: "Internal server error",
      },
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
        err: "Email not verified"
      });
    }

    // TODO: Generate JWT token here
    const token = jwt.sign({
      id: user._id,
      username: user.username,
    }, process.env.JWT_SECRET, {expiresIn: "1d"})

    res.cookie("token", token)

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

export const controllerVerifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Invalid verification link");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user)
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });

    // ✅ Already verified
    if (user.verified) {
      return res.send(`
        <html>
          <body style="font-family: Arial; text-align:center; padding:50px;">
            <h2 style="color:#4f46e5;">Email already verified ✅</h2>
            <p>You can now login to your account.</p>
          </body>
        </html>
      `);
    }

    user.verified = true;
    await user.save();

    // ✅ Success HTML response
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified</title>
      </head>
      <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">

        <div style="max-width:600px; margin:60px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header -->
          <div style="background:#4f46e5; padding:20px; text-align:center; color:white;">
            <h1 style="margin:0;">Perplexity</h1>
          </div>

          <!-- Content -->
          <div style="padding:40px; text-align:center;">
            <h2 style="color:#333;">🎉 Email Verified Successfully!</h2>

            <p style="color:#555; font-size:16px;">
              Your email has been successfully verified.  
              You can now login and start using the platform.
            </p>

            <a href="${process.env.CLIENT_URL}/login"
               style="display:inline-block; margin-top:20px; background:#4f46e5; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
              Go to Login
            </a>
          </div>

          <!-- Footer -->
          <div style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} Perplexity. All rights reserved.
          </div>

        </div>

      </body>
      </html>
    `);
  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return res.status(400).send(`
      <html>
        <body style="font-family: Arial; text-align:center; padding:50px;">
          <h2 style="color:red;">❌ Invalid or Expired Link</h2>
          <p>Please request a new verification email.</p>
        </body>
      </html>
    `);
  }
};

export const controllerGetMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId)

    if(!user) {
      return res.status(404).json({
        success: false,
        message:"User not found",
        err: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
    })
  } catch (err) {
    console.error("GET ME ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

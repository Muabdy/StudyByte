import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRouter = express.Router();
import User from "../models/Users.js";
import Enrollment from "../models/Enrollments.js";

userRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json({ users: users });
});

userRouter.post("/", async (request, response) => {
  const { username, email, password } = request.body;

  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: "password length must be greater than 3" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    email,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

userRouter.post("/login", async (request, response) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);
  if (!(user && passwordCorrect)) {
    return response.status(404).json({ error: "invalid credentials" });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);
  response.status(200).json({
    token,
    username: user.username,
  });
});

// Admin routes
userRouter.post("/admin/verify", async (request, response) => {
  const { password } = request.body;

  if (password === "ninjahero99") {
    response.status(200).json({ success: true });
  } else {
    response.status(401).json({ error: "Invalid admin password" });
  }
});

userRouter.get("/admin/users", async (request, response) => {
  try {
    const users = await User.find({});

    // Get course count for each user
    const usersWithCourses = await Promise.all(
      users.map(async (user) => {
        const courseCount = await Enrollment.countDocuments({ user: user._id });
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          courseCount,
          createdAt: user.createdAt || new Date(),
        };
      })
    );

    response.status(200).json({ users: usersWithCourses });
  } catch (err) {
    response.status(500).json({ error: err.message });
  }
});

userRouter.delete("/admin/users/:userId", async (request, response) => {
  try {
    const { userId } = request.params;

    // Delete all enrollments for this user
    await Enrollment.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    response.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    response.status(500).json({ error: err.message });
  }
});

export default userRouter;

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userCtrl = {
  signUp: async (req, res) => {
    try {
      const { email, firstName, lastName, password } = req.body;

      const user = await User.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "The email in use already." });
      // Password conditions to be added; length, combination, etc

      //Password encryption
      const hashedPassword = await hashPassword(password);
      const newUser = await new User({
        email,
        lastName,
        firstName,
        password: hashedPassword,
      }).save();

      // Create authentication token
      const accessToken = generateToken({ id: newUser._id });
      const refreshToken = generateRefreshToken({ id: newUser._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });
      res.json({
        _id: newUser.id,
        email: newUser.email,
        name: newUser.firstName,
        token: accessToken,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) return res.status(400).json({ msg: "User does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(400).json({ msg: "Invalid credentials." });

      const accessToken = generateToken({ id: user._id });
      const refreshToken = generateRefreshToken({ id: user._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/api/user/refresh_token",
      });
      res.json({
        _id: user.id,
        email: user.email,
        name: user.firstName,
        token: accessToken,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshToken", { path: "/user/refresh_token" });
      res.json({ msg: "Logged out" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken)
        return res.status(400).json({ msg: "Please Login or Sign up" });
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err)
            return res.status(400).json({ msg: "Please Login or Sign up2" });

          const accessToken = generateToken({ id: user.id });

          res.json({ accessToken });
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id.id.id).select("-password");
      if (!user) return res.status(400).json({ msg: "User does not exist" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
module.exports = userCtrl;

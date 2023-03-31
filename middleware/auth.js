const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    console.log(token);

    if (!token)
      return res.status(400).json({ msg: "Invalid Authentication.1" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(400).json({ msg: "Invalid Authentication.2" });

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = auth;

require("dotenv").config();
const express = require("express");

const connectDB = require("./config/db");

const app = express();
connectDB();

const PORT = process.env.PORT || 8000;

// app.get("/", (req, res) => {
//   res.send("Test");
// });

app.use("/api/user", userRoutes);
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

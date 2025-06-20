require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const petRoutes = require("./routes/petRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-Requested-With","Accept","Origin"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/pets", petRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Pet Information API with Cloudinary Integration",
    endpoints: {
      pets: "/api/pets",
      users: "/api/users",
         },
  });
});

app.use((req, res, next) => {
  const error = new Error("Couldn't find the route");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

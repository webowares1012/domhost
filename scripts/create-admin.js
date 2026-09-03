// require("dotenv").config({
//   path: ".env.local",
// });

// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: {
//     type: String,
//     unique: true,
//   },
//   password: String,
//   role: String,
// });

// const User = mongoose.models.User || mongoose.model("User", userSchema);

// async function main() {
//   await mongoose.connect(process.env.MONGODB_URI);

//   const password = await bcrypt.hash("Chirag123@", 12);

//   await User.create({
//     name: "Amit",
//     email: "amit@example.com",
//     password,
//     role: "user",
//   });

//   console.log("Admin created.");

//   await mongoose.disconnect();
// }

// main().catch(console.error);


require("dotenv").config({
  path: ".env.local",
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  role: String,
});
// Import your User model if you have one
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  try {
    console.log("Mongo URI:", process.env.MONGODB_URI ? "Loaded" : "Missing");

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Check your .env.local file."
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    const existingAdmin = await User.findOne({
      email: "admin@example.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const admin = await User.create({
      name: "Administrator",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);
  } catch (error) {
    console.error("Create admin error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
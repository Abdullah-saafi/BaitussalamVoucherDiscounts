import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createLabTech = async (req, res) => {
  const { name, email, password, branchname, branchcode, contact } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newLabTech = new User({
      name,
      email,
      password: hashedPassword,
      branchname,
      branchcode,
      contact,
      role: "lab_tech",
    });

    await newLabTech.save();

    res.status(201).json({ message: "Lab Tech created successfully!" });
  } catch (error) {
    console.error("Create Lab Tech Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabTechs = async (req, res) => {
  try {
    const labTechs = await User.find({ role: "lab_tech" }).select("-password");
    res.json(labTechs);
  } catch (error) {
    console.error("Get Lab Techs Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLabTech = async (req, res) => {
  try {
    const tech = await User.findById(req.params.id);

    if (!tech || tech.role !== "lab_tech") {
      return res.status(404).json({ message: "Not found" });
    }

    await tech.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Lab Tech Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

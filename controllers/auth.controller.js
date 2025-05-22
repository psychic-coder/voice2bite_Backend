import { generateToken } from "../lib/helper.js";
import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import { sendToken } from "../utils/feature.js";

export const registerCustomer = async (req, res) => {
  try {
    const { name, password, email, photoUrl, address } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "Email already in use" });
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        address,
        photoUrl,
      },
    });
    console.log(user);
    const tokenData = user;
    const token = generateToken(user);
    sendToken(res, 200, tokenData, token, "User regitered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal error" });
  }
};

export const registerCompanyAdmin = async (req, res) => {
  try {
    const { name, password, email, photoUrl } = req.body;
    const exists = await prisma.companyAdmin.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "Email already in use" });
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.companyAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "COMPANY_ADMIN",
        photoUrl,
      },
    });
    console.log(user);
    const tokenData = user;
    const token = generateToken(user);
    sendToken(res, 200, tokenData, token, "User regitered successfully");
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to register Company Admin" });
  }
};

export const hotelAdmin = async (req, res) => {
  try {
    console.log(req.body);
    const {
      name,
      email,
      password,
      restaurantName,
      address,
      photoUrl,
      latitude,
      longitude,
      phone,
      hotelTags,
      category,
      desc,
      location
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !restaurantName ||
      !address ||
      latitude == null ||
      longitude == null ||
      !photoUrl ||
      !Array.isArray(category) || category.length === 0 ||
      !Array.isArray(hotelTags) || hotelTags.length === 0 ||
      !desc ||
      !location ||
      !phone
    ) {
      return res.status(400).json({ message: "Send all the fields" });
    }
    
    const existing = await prisma.hotelAdmin.findUnique({
      where: { email },
    });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await prisma.hotelAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "HOTEL_ADMIN",
        restaurant: {
          create: {
            name: restaurantName,
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            photoUrl,
            phone,
            hotelTags,  // array of strings
            category,   // array of strings
            desc,
            location
          }
        }
      },
      include: {
        restaurant: true
      }
    });

    const token = generateToken(admin);
    const tokenData = admin;
    sendToken(res, 200, tokenData, token, "User and Restaurant registered successfully");

  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Failed to register restaurant admin",
    });
  }
};



export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const [regularUser, companyAdmin, hotelAdmin] = await Promise.all([
        prisma.user.findUnique({ where: { email }, include: { orders: true } }),
        prisma.companyAdmin.findUnique({ where: { email } }),
        prisma.hotelAdmin.findUnique({
          where: { email },
          include: {
            restaurant: true,
            confirmedOrders: true,
            createdFoodItems: true,
          },
        }),
      ]);
  
      let user = regularUser || companyAdmin || hotelAdmin;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      let role = "CUSTOMER";
      if (companyAdmin) role = "COMPANY_ADMIN";
      if (hotelAdmin) role = "HOTEL_ADMIN";
  
      const token = generateToken(user);
  
      const responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          ...(hotelAdmin && {
            restaurant: user.restaurant,
            confirmedOrders: user.confirmedOrders,
            createdFoodItems: user.createdFoodItems,
          }),
          ...(regularUser && { orders: user.orders }),
        },
        token,
      };
  
      sendToken(res, 200, responseData, token, "User logged in successfully");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to login" });
    }
  };
  
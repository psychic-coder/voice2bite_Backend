import { TryCatch } from "../middlewares/error.js";
import prisma from "../prisma/client.js";

import bcrypt from "bcryptjs";

export const getCompanyAdminProfile = TryCatch(async (req, res) => {
  const adminId = Number(req.user.id);
  if (isNaN(adminId) || adminId <= 0) {
    return res.status(404).json({ message: "Invalid Admin Id " });
  }

  console.log(req.user.id);
  const admin = await prisma.companyAdmin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      photoUrl: true,
      createdAt: true,
    },
  });

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const safeAdmin = {
    ...admin,
    profileComplete: !!admin.photoUrl,
  };

  res.status(200).json({
    success: true,
    message: "Admin profile retrieved successfully",
    admin: safeAdmin,
  });
});

export const updateCompanyAdminProfile = TryCatch(async (req, res) => {
  const { name, photoUrl, password } = req.body;

  if (!name && !photoUrl && !password) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update.",
    });
  }

  let dataToUpdate = {};

  if (name) dataToUpdate.name = name;
  if (photoUrl) dataToUpdate.photoUrl = photoUrl;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    dataToUpdate.password = hashedPassword;
  }

  const updatedAdmin = await prisma.companyAdmin.update({
    where: {
      id: req.user.id,
    },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      photoUrl: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    admin: updatedAdmin,
  });
});

export const getAllHotelAdmins = TryCatch(async (req, res) => {
  const hotelAdmins = await prisma.hotelAdmin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      restaurant: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "Hotel Admins fetched Successfully",
    hotelAdmins,
    count: hotelAdmins.length,
  });
});

export const getAllRestaurants = TryCatch(async (req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      location: true,
      rating: true,
      hotelTags: true,
      desc: true,
      category: true,

      photoUrl: true,
      phone: String,
      hotelAdmins: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "Fetched all restaurants successfully",
    restaurants,
  });
});

export const getSingleRestaurant = TryCatch(async (req, res) => {
  const restaurantId = parseInt(req.params.id);
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true,
      name: true,
      address: true,
      location:true,
      rating:true,
      hotelTags:true,
      desc:true,
      category:true,

      hotelAdmins: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      foodItems: {
        select: {
          id: true,
          name: true,
          price: true,
          description:true,
          tags:true,
          photoUrl:true
        },
      },
    },
  });
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Fetched restaurant successfully",
    restaurant,
  });
});

export const getAllOrders = TryCatch(async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      orderItems: {
        include: {
          foodItem: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "All orders fetched successfully",
    orders,
  });
});

export const deleteRestaurant = TryCatch(async (req, res) => {
  const restaurantId = parseInt(req.params.id);

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  await prisma.hotelAdmin.deleteMany({
    where: { restaurantId },
  });

  await prisma.restaurant.delete({
    where: { id: restaurantId },
  });

  res.status(200).json({
    success: true,
    message: "Restaurant and related hotel admins deleted successfully",
  });
});


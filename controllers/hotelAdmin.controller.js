import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/errorHandler.js";
import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";

export const getHotelAdminProfile = TryCatch(async (req, res, next) => {
  const adminId = req.user.id;

  const hotelAdmin = await prisma.hotelAdmin.findUnique({
    where: { id: adminId },
    include: {
      restaurant: {
        include: {
          foodItems: true,
          orders: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              orderItems: {
                include: { foodItem: true },
              },
            },
          },
        },
      },
    },
  });

  if (!hotelAdmin) return next(new ErrorHandler("Hotel admin not found", 404));

  const { id, name, email, photoUrl, restaurant } = hotelAdmin;
  const { foodItems, orders, ...restDetails } = restaurant;

  res.status(200).json({
    success: true,
    message: "Hotel admin profile retrieved successfully",
    profile: {
      id,
      name,
      email,
      photoUrl,
      restaurant: {
        ...restDetails,
        totalFoodItems: foodItems.length,
        recentOrders: orders.map(
          ({ id, totalAmount, status, createdAt, orderItems }) => ({
            id,
            totalAmount,
            status,
            createdAt,
            items: orderItems.map(({ foodItem, quantity }) => ({
              name: foodItem.name,
              quantity,
              price: foodItem.price,
            })),
          })
        ),
      },
    },
  });
});

export const updateHotelAdminProfile = TryCatch(async (req, res) => {
    const {id}=req.user;
  const {
    name,
    email,
    password,
    restaurantName,
    address,
    latitude,
    longitude,
    photoUrl,
  } = req.body;


const updateData = {};
if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const restaurantUpdateData = {};
  if (restaurantName) restaurantUpdateData.name = restaurantName;
  if (address) restaurantUpdateData.address = address;
  if (latitude !== undefined) restaurantUpdateData.latitude = parseFloat(latitude);
  if (longitude !== undefined) restaurantUpdateData.longitude = parseFloat(longitude);
  if (photoUrl) restaurantUpdateData.photoUrl = photoUrl;
  const hotelAdmin=await prisma.hotelAdmin.update({
    where:{id},
    data: {
        ...updateData,
        restaurant: Object.keys(restaurantUpdateData).length > 0
          ? {
              update: restaurantUpdateData,
            }
          : undefined,
      },
    include:{restaurant:true}
  })

  const safeData=hotelAdmin;
  res.status(200).json({
success:true,
message:"Hotel admin profile updated successfully",
hotelAdmin:safeData
  })
});


export const createFoodItems=TryCatch(async (req,res)=>{
    const{name,description,price,tags,photoUrl}=req.body;
    if(!name||!price){
        return res.status(400).json({message:"Name and price are required"})
    }   
    const {id}=req.user;
    const admin=await prisma.hotelAdmin.findUnique({
        where:{id},
        include:{restaurant:true},
    })

    const foodItem=await prisma.foodItem.create({
        data:{
            name,
            description,
            price:parseFloat(price),
            tags:tags?.map(t=>t.toLowerCase().replace(/[^a-z0-9]/gi, "")) ||[],
            photoUrl,
            restaurantId:admin.restaurantId,
            createdById:id
        }
    })
    res.status(201).json({
        success:true,
        message:"foodItem created",
        foodItem
    })
})

export const updateFoodItem = TryCatch(async (req, res) => {
    const { id } = req.user;
   
  
    const foodItemId = parseInt(req.params.foodItemId);
    const { name, description, price, tags, photoUrl } = req.body;
  
    const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
  
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
  
    if (foodItem.createdById !== id) {
      return res.status(403).json({ message: "You can only update your own food items" });
    }
  
    const updatedItem = await prisma.foodItem.update({
      where: { id: foodItemId },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        tags: tags?.map(t => t.toLowerCase().replace(/[^a-z0-9]/gi, "")),
        photoUrl,
      },
    });
  
    res.status(200).json({
      success: true,
      message: "Food item updated",
      foodItem: updatedItem,
    });
  });

  export const deleteFoodItem = TryCatch(async (req, res) => {
    const { id: userId, role } = req.user;
    const foodItemId = parseInt(req.params.foodItemId);
  
    if (role !== "HOTEL_ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
  
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId },
    });
  
    if (!foodItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }
  
    if (foodItem.createdById !== userId) {
      return res.status(403).json({ success: false, message: "You can only delete your own food items" });
    }
  
    await prisma.foodItem.delete({
      where: { id: foodItemId },
    });
  
    res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
    });
  });



export const getHotelOrders = TryCatch(async (req, res) => {
    const { id: userId } = req.user;
  
    
  
    const hotelAdmin = await prisma.hotelAdmin.findUnique({
      where: { id: userId },
      include: { restaurant: true },
    });
  
    if (!hotelAdmin || !hotelAdmin.restaurant) {
      return res.status(404).json({ message: "Hotel admin or associated restaurant not found" });
    }
  
    const orders = await prisma.order.findMany({
      where: { restaurantId: hotelAdmin.restaurant.id },
      include: {
        user: true,
        orderItems: {
          include: {
            foodItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  });

  export const updateOrderStatus = TryCatch(async (req, res) => {
    const { id: adminId } = req.user; 
    const { orderId, status } = req.params;
  
    const validStatuses = ["CONFIRMED", "REJECTED", "DELIVERED"];
    const statusUpper = status.toUpperCase();
  
    if (!validStatuses.includes(statusUpper)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be CONFIRMED, REJECTED, or DELIVERED.",
      });
    }
  
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        restaurant: {
          select: { createdById: true }, 
        },
      },
    });
  
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }
  
  
    if (order.restaurant.createdById !== adminId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this order.",
      });
    }
  
    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot update an order that is already ${order.status}`,
      });
    }
  
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: statusUpper,
      },
    });
  
    res.status(200).json({
      success: true,
      message: `Order status updated to ${statusUpper}`,
      order: updatedOrder,
    });
  });
  


  export const getAllFoodItems = TryCatch(async (req, res, next) => {
    const adminId = req.user.id;
  
    
    const hotelAdmin = await prisma.hotelAdmin.findUnique({
      where: { id: adminId },
      select: { restaurantId: true }
    });
  
    if (!hotelAdmin) return next(new ErrorHandler("Hotel admin not found", 404));
  
    
    const foodItems = await prisma.foodItem.findMany({
      where: {
        restaurantId: hotelAdmin.restaurantId
      },
      orderBy: { id: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  
    
    const formattedItems = foodItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      isAvailable: item.isAvailable,
      tags: item.tags,
      photoUrl: item.photoUrl,
      createdAt: item.createdAt,
      createdBy: item.createdBy
    }));
  
    res.status(200).json({
      success: true,
      message: "Food items retrieved successfully",
      data: formattedItems
    });
  });


  export const getFoodItemById=TryCatch(async (req,res)=>{
    const foodItemId= req.params.id;


    if (!foodItemId || isNaN(foodItemId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid food item ID' 
      });
    }

    const foodItem=await prisma.foodItem.findUnique({
      where: {
        id: Number(foodItemId),
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            location: true,
            rating: true,
            photoUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if(!foodItem){
      return res.status(400).json({
        message:"Item not found",
        success:false
      })
    }

    return res.status(200).json({
      success:true,
      message:"Item is successfully found",
      foodItem
    })

  })
  
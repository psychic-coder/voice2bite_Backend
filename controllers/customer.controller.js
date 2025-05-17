import { TryCatch } from "../middlewares/error.js";
import prisma from "../prisma/client.js";

export const getCustomerProfile = TryCatch(async (req, res) => {
  const customer = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { orders: true },
  });
  res
    .status(200)
    .json({ success: true, message: "Successfully got the data", customer });
});

export const updateCustomerProfile = TryCatch(async (req, res) => {
  const { name, email, photoUrl } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, email, photoUrl },
  });
  res.status(201).json({
    success: true,
    message: "Updated the profile Successfully",
  });
});

//demo api ---> http://yourdomain.com//customerrestaurants/nearby?latitude=40.7128&longitude=-74.0060
export const getNearbyRestaurants = TryCatch(async (req, res) => {
  const { latitude, longitude } = req.query;
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const restaurants = await prisma.restaurant.findMany({
    where: {
      latitude: { gte: lat - 0.1, lte: lat + 0.1 },
      longitude: { gte: lon - 0.1, lte: lon + 0.1 },
    },
  });
  console.log(restaurants);
  res.json(restaurants);
});


//demo api---->http://yourdomain.com/customer/restaurantMenu/1
export const getRestaurantMenu = TryCatch(async (req, res) => {
    const { id } = req.params;
    const restaurantId = parseInt(id, 10); 
  
    if (isNaN(restaurantId)) {
     
      return res.status(400).json({ success: false, message: "Invalid restaurant ID.  ID must be a number." });
    }
  
  const menu = await prisma.foodItem.findMany({
    where: { restaurantId: restaurantId },
  });
  res
    .status(201)
    .json({ success: true, message: "successfully fetched he menu", menu });
});


export const placeOrder = TryCatch(async (req, res) => {
    const { items, restaurantId } = req.body;
    
    
    const foodItems = await prisma.foodItem.findMany({
        where: { id: { in: items.map(item => item.foodItemId) } },
        select: { id: true, price: true }
    });

   
    const priceMap = foodItems.reduce((map, item) => (map[item.id] = item.price, map), {});
    const totalAmount = items.reduce((total, item) => 
        total + (priceMap[item.foodItemId] * item.quantity), 0);

   
    const order = await prisma.order.create({
        data: {
            userId: req.user.id,
            restaurantId,
            totalAmount,
            orderItems: {
                create: items.map(item => ({
                    foodItemId: item.foodItemId,
                    quantity: item.quantity
                }))
            }
        },
        include: {
            orderItems: true  
        }
    });

    res.status(201).json({ 
        success: true,
        message: "Order placed successfully",
        order 
    });
});



export const getOrderHistory=TryCatch(async (req,res)=>{
    const orders=await prisma.order.findMany({
        where:{userId:req.user.id},
        include:{
            orderItems:{
                include:{foodItem:true}
            }
        }
    });
    res.json({success:true,message:"The orders are seen successfully",orders})
})


export const getFoodItemByTags = TryCatch(async (req, res) => {
    let { tags } = req.body;
  
    // Validate the incoming tag array
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tags must be a non-empty array",
      });
    }
  
   
    const normalize = (str) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");
  
    const normalizedInputTags = tags.map(normalize);
  
  
    const allItems = await prisma.foodItem.findMany({
      include: { restaurant: true },
    });
  
   //for matching the data
    const matchedItems = allItems.filter((item) => {
      const normalizedItemTags = item.tags.map(normalize);
      return normalizedItemTags.some(tag =>
        normalizedInputTags.includes(tag)
      );
    });
  
    res.status(200).json({
      success: true,
      count: matchedItems.length,
      matchedItems,
      message: "Matched food items based on tags",
    });
  });
  
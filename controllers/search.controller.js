import redisClient from "../lib/redis.js";
import { TryCatch } from "../middlewares/error.js";
import prisma from "../prisma/client.js";

export const addSearch = TryCatch(async (req, res) => {
  const { query } = req.body;
  if (!query)
    return res.status(400).json({
      success: false,
      message: "Query required",
    });

  const word = query.toLowerCase();

  const matchingFoodItems = await prisma.foodItem.findMany({
    where: {
      OR: [
        { name: { contains: word, mode: "insensitive" } },
        { tags: { has: word } },
      ],
    },
    include: {
      restaurant: true,
    },
  });
 

const matchingRestaurants = await prisma.restaurant.findMany({
  where: {
    OR: [
      { name: { contains: word, mode: "insensitive" } },
      { hotelTags: { has: query } },   
      { category: { has: query } },    
    ],
  },
});


  const foodItems = matchingFoodItems.map((item) => ({
    itemName: item.name,
    itemTags: item.tags,
    itemPrice: item.price,
    hotelName: item.restaurant.name,
    itemImage: item.photoUrl,
    hotelId: item.restaurant.id,
    itemId: item.id,
  }));

  const hotels = matchingRestaurants.map((hotel) => ({
    restaurantName: hotel.name,
    restaurantId: hotel.id,
    restaurantTags: hotel.hotelTags,
    restaurantDescription: hotel.desc,
    restaurantAddress: hotel.address,
    restaurantCategories: hotel.category,
    rating: hotel.rating,
    phone: hotel.phone,
  }));

  const RECENT_SEARCH_KEY = `recent:searches:${req.user.id}`;

  await redisClient.lRem(RECENT_SEARCH_KEY, 0, query);
  await redisClient.lPush(RECENT_SEARCH_KEY, query);
  await redisClient.lTrim(RECENT_SEARCH_KEY, 0, 9);


  

  res.status(200).json({
    message: "Query made successfully",
    success: true,
    hotels,
    foodItems,
  });
});

export const getRecentSearches = TryCatch(async (req, res) => {
  const RECENT_SEARCH_KEY = `recent:searches:${req.user.id}`;
  const searches = await redisClient.lRange(RECENT_SEARCH_KEY, 0, 9);
  return res.status(200).json({
    message: "Get recent searches",
    success: true,
    searches,
  });
});

export const clearRecentSearches = TryCatch(async (req, res) => {
  const RECENT_SEARCH_KEY = `recent:searches:${req.user.id}`;
  await redisClient.del(RECENT_SEARCH_KEY);
  return res.json({
    message: "All recent searches cleared",
    success: true,
  });
});

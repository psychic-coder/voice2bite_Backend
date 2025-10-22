import redisClient from "../lib/redis.js";
import { TryCatch } from "../middlewares/error.js";
import prisma from "../prisma/client.js";

export const addSearch = TryCatch(async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Query required",
    });
  }

  const word = query.toLowerCase();

  // Find matching food items
  const matchingFoodItems = await prisma.foodItem.findMany({
    where: {
      OR: [
        { name: { contains: word, mode: "insensitive" } },
        { tags: { has: word } },
      ],
    },
    include: { restaurant: true },
  });

  // Find matching restaurants
  const matchingRestaurants = await prisma.restaurant.findMany({
    where: {
      OR: [
        { name: { contains: word, mode: "insensitive" } },
        { hotelTags: { has: query } },
        { category: { has: query } },
      ],
    },
  });

  // Format food items
  const foodItems = matchingFoodItems.map((item) => ({
    itemName: item.name,
    itemTags: item.tags,
    itemPrice: item.price,
    hotelName: item.restaurant.name,
    itemImage: item.photoUrl,
    hotelId: item.restaurant.id,
    itemId: item.id,
  }));

  // Format restaurants
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

  // Redis recent search key per user
  const RECENT_SEARCH_KEY = `recent:searches:${req.user.id}`;

  //  Remove duplicates before pushing again
  const existingSearches = await redisClient.lrange(RECENT_SEARCH_KEY, 0, 9);
  const filteredSearches = existingSearches.filter((s) => s !== query);
  if (filteredSearches.length < existingSearches.length) {
    await redisClient.del(RECENT_SEARCH_KEY);
    await redisClient.rpush(RECENT_SEARCH_KEY, ...filteredSearches);
  }

  // Add new query to front of list
  await redisClient.lpush(RECENT_SEARCH_KEY, query);

  //  Keep only last 10 searches
  await redisClient.ltrim(RECENT_SEARCH_KEY, 0, 9);

  return res.status(200).json({
    message: "Query made successfully",
    success: true,
    hotels,
    foodItems,
  });
});

// Get recent searches
export const getRecentSearches = TryCatch(async (req, res) => {
  const RECENT_SEARCH_KEY = `recent:searches:${req.user.id}`;
  const searches = await redisClient.lrange(RECENT_SEARCH_KEY, 0, 9);
  return res.status(200).json({
    message: "Get recent searches",
    success: true,
    searches,
  });
});

//  Clear recent searches
export const clearRecentSearches = TryCatch(async (req, res) => {
  const RECENT_SEARCH_KEY = `recent:searches:${req.user.id}`;
  await redisClient.del(RECENT_SEARCH_KEY);
  return res.json({
    message: "All recent searches cleared",
    success: true,
  });
});
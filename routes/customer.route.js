import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { getCustomerProfile, getFoodItemByTags, getNearbyRestaurants, getOrderHistory, getRestaurantMenu, placeOrder, updateCustomerProfile } from "../controllers/customer.controller.js";
import { getAllRestaurants } from "../controllers/companyAdmin.controller.js";


const router=express.Router();
router.use(isAuthenticated)
router.get("/me",getCustomerProfile);
router.put("/me",updateCustomerProfile);
router.get("/restaurants/nearby",getNearbyRestaurants);
router.get("/restaurantMenu/:id",getRestaurantMenu);
router.get("/getAllRestaurants",getAllRestaurants);
router.post("/placeOrder",placeOrder);
router.get("/orderHistory",getOrderHistory);
router.post("/getFoodItemsByTags",getFoodItemByTags)


export default router;

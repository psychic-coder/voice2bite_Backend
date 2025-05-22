import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { getCustomerProfile, getFoodItemByTags, getNearbyRestaurants, getOrderHistory, getRestaurantMenu, placeOrder, updateCustomerProfile } from "../controllers/customer.controller.js";
import { getAllRestaurants, getSingleRestaurant } from "../controllers/companyAdmin.controller.js";


const router=express.Router();

router.use(isAuthenticated)
router.get("/getAllRestaurants",getAllRestaurants);
router.get("/getAllRestaurants/:id",getSingleRestaurant);
router.get("/me",getCustomerProfile);
router.put("/me",updateCustomerProfile);
router.get("/restaurants/nearby",getNearbyRestaurants);
router.get("/restaurantMenu/:id",getRestaurantMenu);

router.post("/placeOrder",placeOrder);
router.get("/orderHistory",getOrderHistory);
router.post("/getFoodItemsByTags",getFoodItemByTags)


export default router;

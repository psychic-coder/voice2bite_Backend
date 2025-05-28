import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

import {  confirmHotelOrder, createFoodItems, deleteFoodItem, getAllFoodItems, getHotelAdminProfile, getHotelOrders, updateFoodItem, updateHotelAdminProfile } from "../controllers/hotelAdmin.controller.js";
import { deleteRestaurant } from "../controllers/companyAdmin.controller.js";


const router=express.Router();
router.use(isAuthenticated,authorizeRoles("HOTEL_ADMIN"));
router.get("/me",getHotelAdminProfile);
router.put("/me",updateHotelAdminProfile);
router.post("/addFoodItem",createFoodItems);
router.put("/updateFoodItem/:foodItemId",updateFoodItem);
router.delete("/deleteFoodItem/:foodItemId",deleteFoodItem);
router.get("/orders",getHotelOrders);
router.get("/:orderId/confirmOrder",confirmHotelOrder);
router.delete("/deleteRestaurant/:id",deleteRestaurant);
router.get("/getAllFoodItems",getAllFoodItems);



export default router;
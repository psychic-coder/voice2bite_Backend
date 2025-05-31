import express from "express"
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";
import { deleteRestaurant, getAllHotelAdmins, getAllOrders, getAllRestaurants, getCompanyAdminProfile, getSingleRestaurant, updateCompanyAdminProfile } from "../controllers/companyAdmin.controller.js";

const router=express.Router();

router.use(isAuthenticated,authorizeRoles("COMPANY_ADMIN"));
router.get("/me",getCompanyAdminProfile);
router.put("/me",updateCompanyAdminProfile);
router.get("/hotelAdmins",getAllHotelAdmins);
router.get("/getAllRestaurants",getAllRestaurants);
router.get("/getAllRestaurants/:id",getSingleRestaurant);
router.get("/getAllOrders",getAllOrders);
router.delete("/deleteRestaurant/:id",deleteRestaurant);



export default router;
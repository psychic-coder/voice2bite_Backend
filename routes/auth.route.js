import express from "express";
import { hotelAdmin, login, registerCompanyAdmin, registerCustomer } from "../controllers/auth.controller.js";

const router=express.Router();

router.post("/registerCustomer",registerCustomer);
router.post("/registerCompanyAdmin",registerCompanyAdmin);
router.post("/registerHotelAdmin",hotelAdmin);
router.post("/login",login);

export default router;


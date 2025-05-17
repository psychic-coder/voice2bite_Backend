import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken";


export const isAuthenticated = TryCatch((req, res, next) => {
   
    const token = req.cookies["access_token"];
    if (!token)
      return next(new ErrorHandler("Please login to access this route", 401));
  
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  
    console.log("", decodedData);
    req.user = decodedData;
  
    next();
  });
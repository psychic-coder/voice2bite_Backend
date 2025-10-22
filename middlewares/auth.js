import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken";


export const isAuthenticated = TryCatch((req, res, next) => {
   
    const token = req.cookies["access_token"];
    if (!token)
      return next(new ErrorHandler(401, "Please login to access this route"));

  
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData;
  
    next();
  });


  export const authorizeRoles=(...allowedRoles)=>{
    return (req,res,next)=>{
      const {role} =req.user || {};
      if(!role || !allowedRoles.includes(role)){
        return res.status(403).json({
          message:`Access denied. Required role ${allowedRoles.join(",")}`
        });
      }
      next();
    }
  }
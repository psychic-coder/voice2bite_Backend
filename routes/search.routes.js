import express from "express"
import { addSearch, clearRecentSearches, getRecentSearches } from "../controllers/search.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";


const routes=express.Router();

routes.use(isAuthenticated)
routes.post("/add",addSearch);
routes.get("/",getRecentSearches);
routes.delete("/clear",clearRecentSearches);



export default routes;
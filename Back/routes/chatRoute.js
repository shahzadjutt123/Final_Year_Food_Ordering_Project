import express from "express"
import authMiddleware from "../middleware/auth.js"
import { getChatHistory, saveChating } from "../controllers/chatController.js";
const chatRouter=express.Router();

chatRouter.post("/save",authMiddleware,saveChating)
chatRouter.post("/get",authMiddleware,getChatHistory)
 export default chatRouter;
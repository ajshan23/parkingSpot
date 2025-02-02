import { Router } from "express";
import {

    parkTheVehicle,
    getParkedVehicle,
    checkOut
} from "../controllers/parkVehicle";
import protect from "@/middleware/authMiddleware";

const router = Router();


router.post("/", protect, parkTheVehicle);
router.get("/", protect, getParkedVehicle);
router.post("/checkout", protect, checkOut);

export default router;

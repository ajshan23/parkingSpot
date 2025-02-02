import { Router } from "express";
import { addSpot, editSpot, deleteSpot } from "../controllers/spotController";
import { searchAvailableSpot } from "@/controllers/parkVehicle";

const router = Router();

router.post("/add", addSpot);
router.put("/edit/:id", editSpot);
router.delete("/delete/:id", deleteSpot);
router.get("/search", searchAvailableSpot);

export default router;

import express from "express";
import {
  create,
  findAll,
  findById,
  update,
  deleteRing,
  version,
  versions,
} from "../controllers/rings";
import validateResource from "../middlewares/validateResources";
import { createRingValidationSchema } from "../validation/rings";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Create a new Ring
router.post(
  "/create",
  checkAuth,
  validateResource(createRingValidationSchema),
  create
);

// Retrieve all Rings
router.get("/", checkAuth, findAll);

// Retrieve Ring by Id
router.get("/:ringId", checkAuth, findById);

// Retrieve Ring Versions
router.get("/:rid/versions", checkAuth, versions);

// Retrieve Ring Version
router.get("/:rid/:version", checkAuth, version);

// Update a Ring
router.put("/:ringId", checkAuth, update);

// Delete a Ring
router.delete("/:ringId", checkAuth, deleteRing);

export default router;

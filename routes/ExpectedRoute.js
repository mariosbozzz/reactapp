import express from "express";

import { createExpected,getExpected } from "../controllers/Expected.js";

import { verifyUser } from "../middleware/AuthUser.js";
const router = express.Router();
router.get('/expected',verifyUser, getExpected);
router.post('/expected',verifyUser, createExpected);

export default router;
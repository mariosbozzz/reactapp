import express from "express";

import { createChart,getChart ,deleteChart,getTotalAssists,getTotalStatistics,updateChart,getChartById} from "../controllers/Chart.js";

import { verifyUser } from "../middleware/AuthUser.js";
const router = express.Router();
router.get('/charts',verifyUser, getChart);
router.post('/charts',verifyUser, createChart);
router.delete('/charts/:id',verifyUser, deleteChart);

router.get('/charts1',verifyUser, getTotalAssists);
router.get('/charts2',verifyUser, getTotalStatistics);


router.get('/charts/:id',verifyUser, getChartById);
router.patch('/charts/:id',verifyUser, updateChart);
export default router;
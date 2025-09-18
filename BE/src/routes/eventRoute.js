import express, { Router } from 'express'
import { createEvent } from "../controllers/eventController.js";

const router= express.Router()

router.post('/create-event', createEvent)

export default router;
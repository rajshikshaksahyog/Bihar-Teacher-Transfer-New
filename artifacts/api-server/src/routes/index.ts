import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import teachersRouter from "./teachers";
import transfersRouter from "./transfers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(teachersRouter);
router.use(transfersRouter);

export default router;

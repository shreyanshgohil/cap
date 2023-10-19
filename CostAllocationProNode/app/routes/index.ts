import express from 'express';
import { customError, notFound } from '../helpers/errorHandler';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import companyRoutes from './companyRoutes';
import roleRoutes from './roleRoutes';
import permissionRoutes from './permissionRoutes';
import quickbooksRoutes from './quickbooksRoutes';
import employeeRoutes from './employeeRoutes';
import timeActivityRoutes from './timeActivityRoutes';
import splitTimeActivityRoutes from './splitTimeActivityRoutes';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { Request, Response } from 'express';
import configuration from './configuration';
import employeeCostRouter from './employeeCostRoutes';
import timeSheetRouter from './timeSheetRoutes';
import payPeriodRouter from './payPeriodRoutes';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', isAuthenticated, userRoutes);
router.use('/companies', isAuthenticated, companyRoutes);
router.use('/role', isAuthenticated, roleRoutes);
router.use('/permission', permissionRoutes);
router.use('/quickbooks', quickbooksRoutes);
router.use('/employees', employeeRoutes);
router.use('/time-activities', timeActivityRoutes);
router.use('/configuration', configuration);
router.use('/employee-cost', employeeCostRouter);
router.use('/split-time-activity', splitTimeActivityRoutes);
router.use('/time-sheet', timeSheetRouter);
router.use('/pay-periods', payPeriodRouter);

router.use('/test', (req: Request, res: Response) => {
	return res.json({ data: 'Hello world!' });
});
router.use(notFound);
router.use(customError);

export default router;

import express from 'express';
import { timeSheetController } from '../controllers';

import { createTimeSheetValidator } from '../helpers/validators';
import { isAuthenticated } from '../middlewares/authMiddleware';
const router = express.Router();

// Get time sheet logs by employee
// router.get(
// 	'/employee',
// 	isAuthenticated,
// 	timeSheetController.getAllTimeSheetLogs
// );

router.get(
	'/employees',
	isAuthenticated,
	timeSheetController.getTimeSheetWiseEmployees
);

// Get all time sheets
router.get('/', isAuthenticated, timeSheetController.getAllTimeSheets);

router.get(
	'/by-payPeriod',
	isAuthenticated,
	timeSheetController.getTimeSheetByPayPeriod
);
// Get time sheet details
router.get('/:id', isAuthenticated, timeSheetController.getTimeSheetDetails);

// Create new time sheet by date
router.post(
	'/',
	isAuthenticated,
	createTimeSheetValidator,
	timeSheetController.createTimeSheet
);

// Email time sheet
router.post('/email', isAuthenticated, timeSheetController.emailTimeSheet);

export default router;

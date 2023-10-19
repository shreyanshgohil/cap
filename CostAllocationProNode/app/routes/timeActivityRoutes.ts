import express from 'express';
import { timeActivityController } from '../controllers';
import {
	createTimeActivityValidation,
	deleteTimeActivityValidation,
	timeActivityValidation,
	updateTimeActivityValidation,
} from '../helpers/validators';
import { isAuthenticated } from '../middlewares/authMiddleware';
// import { employeeValidation } from '../helpers/validators';
const router = express.Router();

// Sync time activities
router.post(
	'/sync',
	isAuthenticated,
	timeActivityValidation,
	timeActivityController.syncTimeActivities
);

// Get all time activities from db
router.get('/', isAuthenticated, timeActivityController?.getAllTimeActivities);

// Update time activity
router.put(
	'/',
	isAuthenticated,
	updateTimeActivityValidation,
	timeActivityController?.updateTimeActivity
);

// Create time activity
router.post(
	'/create',
	isAuthenticated,
	createTimeActivityValidation,
	timeActivityController?.createTimeActivity
);

// Delete time activity
router.delete(
	'/',
	isAuthenticated,
	deleteTimeActivityValidation,
	timeActivityController?.deleteTimeActivity
);

// Export time activity
router.get(
	'/export',
	isAuthenticated,
	// timeActivityController.exportTimeActivityExcel
	timeActivityController.exportTimeActivity
);

// Export time activity
router.post(
	'/exportpdf',
	isAuthenticated,
	timeActivityController.exportTimeActivityPdf
);

export default router;

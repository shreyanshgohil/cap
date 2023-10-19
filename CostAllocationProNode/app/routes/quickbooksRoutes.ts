import express from 'express';
import { quickbooksController } from '../controllers';
import { isAuthenticated } from '../middlewares/authMiddleware';
import {
	quickbooksAccountsValidation,
	quickbooksClassValidation,
	quickbooksCustomersValidation,
	quickbooksEmployeeValidation,
	quickbooksTimeActivityValidation,
} from '../helpers/validators';
const router = express.Router();

// Get Quickbooks Auth URL
router.get(
	'/authurl',
	isAuthenticated,
	quickbooksController.getQuickbooksAuthUri
);

// Quickbooks Callback
router.post(
	'/callback',
	isAuthenticated,
	quickbooksController.quickbooksCallback
);

// Disconnect company
router.post(
	'/disconnect',
	isAuthenticated,
	quickbooksController.quickbooksDisconnect
);

// Update status
router.put('/', isAuthenticated, quickbooksController.updateCompanyStatus);

router.post(
	'/employees',
	isAuthenticated,
	quickbooksEmployeeValidation,
	quickbooksController.getAllQBEmployees
);

router.post(
	'/accounts',
	isAuthenticated,
	quickbooksAccountsValidation,
	quickbooksController.getAllAccounts
);

router.post(
	'/customers',
	isAuthenticated,
	quickbooksCustomersValidation,
	quickbooksController.getAllCustomer
);

router.post(
	'/classes',
	isAuthenticated,
	quickbooksClassValidation,
	quickbooksController.getAllClasses
);

router.post('/company', quickbooksController.getCompanyInfo);

// Sync time activities for the first time
router.post(
	'/time-activities',
	isAuthenticated,
	quickbooksTimeActivityValidation,
	quickbooksController.getAllTimeActivities
);

export default router;

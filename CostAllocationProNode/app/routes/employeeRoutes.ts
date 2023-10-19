import express from 'express';
import employeeController from '../controllers/employeeController';
import { employeeValidation } from '../helpers/validators';
import { isAuthenticated } from '../middlewares/authMiddleware';
const router = express.Router();

// Get all employees from db
router.post('/', employeeValidation, employeeController.getAllEmployees);

// Sync when company connect
router.post(
	'/sync',
	employeeValidation,
	isAuthenticated,
	employeeController.syncEmployees
);

export default router;

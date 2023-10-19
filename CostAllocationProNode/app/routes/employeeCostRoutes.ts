import { Router } from 'express';
import { employeeCostController } from '../controllers';
import {
	employeeCostCreateValidation,
	employeeCostUpdateValidation,
} from '../helpers/validators';
import { isAuthenticated } from '../middlewares/authMiddleware';
const employeeCostRouter = Router();

employeeCostRouter.get(
	'/',
	isAuthenticated,
	employeeCostController.getMonthlyCost
);
employeeCostRouter.post(
	'/',
	employeeCostCreateValidation,
	isAuthenticated,
	employeeCostController.createMonthlyCost
);
employeeCostRouter.put(
	'/',
	employeeCostUpdateValidation,
	isAuthenticated,
	employeeCostController.updateMonthlyCost
);
employeeCostRouter.get('/export', employeeCostController.exportEmployeeCost);
employeeCostRouter.get('/total', isAuthenticated, employeeCostController.employeeCostTotal);

export default employeeCostRouter;

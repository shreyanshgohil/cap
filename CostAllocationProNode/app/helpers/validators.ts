// import { TimeSheetsStatus } from '../enum';

/* eslint-disable @typescript-eslint/no-var-requires */
const { body } = require('express-validator');

// CompanyId Validation
export const companyIdValidation = [
	body('companyId')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid company id'),
];

// Login validation rules
export const loginValidationRules = [
	// Validate email
	body('email').isEmail().withMessage('Invalid email address'),

	// Validate password
	body('password').notEmpty().withMessage('Password is required'),
];

// Forgot Password validation rules
export const forgotPasswordValidationRules = [
	// Validate email
	body('email').isEmail().withMessage('Invalid email address'),
];

// Change Password validation rules
export const changePasswordValidationRules = [
	// Validate password
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
		)
		.withMessage(
			'Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 8 characters long'
		),

	// Validate confirmPassword
	body('confirmPassword')
		.notEmpty()
		.withMessage('Confirm password required')
		.custom((value: any, { req }: any) => {
			if (value !== req.body.password) {
				throw new Error('Passwords do not match');
			}
			return true;
		}),
];

// Invite User validation rules
export const inviteUserValidationRules = [
	body('email').isEmail().withMessage('Invalid email address'),
	body('role')
		.notEmpty()
		.withMessage('Role id is required')
		.isUUID()
		.withMessage('Invalid role'),
	body('company')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid company'),
];

// Delete User from Company
export const deleteUserFromCompanyRules = [
	body('user')
		.notEmpty()
		.withMessage('User id is required')
		.isUUID()
		.withMessage('Invalid User'),
	body('company')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid Company'),
];

// Update profile validation rules

export const updateProfileValidationRules = [
	body('firstName')
		.optional()
		.isLength({ min: 2 })
		.withMessage('First name must be at least 2 characters'),
	body('lastName')
		.optional()
		.isLength({ min: 2 })
		.withMessage('Last name must be at least 2 characters'),
	body('phone')
		.optional()
		.matches(/^\d{10}$/)
		.withMessage('Invalid phone number format'),
];

// for roles

export const companyIdValidationRules = [
	body('orgId').notEmpty().withMessage('Please select the organization'),
];

export const createRoleValidationRules = [
	...companyIdValidationRules,
	body('roleName').notEmpty().withMessage('Please enter the role name'),
	body('roleDescription')
		.notEmpty()
		.withMessage('Please enter the role description'),
];

export const updateRoleValidationRules = [
	...companyIdValidationRules,
	body('roleId').notEmpty().withMessage('Please enter the role id'),
	body('roleName').optional(),
	body('roleDescription').optional(),
];

export const deleteRoleValidationRules = [
	...companyIdValidationRules,
	body('roleId').notEmpty().withMessage('Please enter the role id'),
];

export const permissionRoleValidationRules = [
	...companyIdValidationRules,
	body('roleId').notEmpty().withMessage('Please enter the role id'),
	body('permissions').notEmpty().withMessage('Please enter the permissions'),
];

// Update User By Admin
export const updateUserByAdminValidation = [
	body('userId').notEmpty().withMessage('User id is required'),
	body('companyId').notEmpty().withMessage('Company id is required'),
];

export const quickbooksEmployeeValidation = [
	body('companyId')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid company'),
];

export const quickbooksClassValidation = [
	body('companyId')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid company'),
];

export const quickbooksCustomersValidation = [
	body('companyId')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid company'),
];

export const quickbooksAccountsValidation = [
	body('companyId')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid company'),
];

export const quickbooksTimeActivityValidation = [...companyIdValidation];

const payrollMethods = ['Hours', 'Percentage'];

export const companyGetConfigurationValidation = [...companyIdValidation];

export const companyConfigurationValidation = [
	...companyIdValidation,
	body('indirectExpenseRate')
		.notEmpty()
		.withMessage('Expense Rate is required'),
	body('payrollMethod')
		.notEmpty()
		.withMessage('Payroll Method is required')
		.isIn(payrollMethods)
		.withMessage('Payroll Method is not valid'),
	body('settings').notEmpty().withMessage('Settings field is required'),
	// .isArray()
	// .withMessage('Data must be a non-empty array'),
];

// Employee Validation
export const employeeValidation = [...companyIdValidation];

// Time Activities

export const timeActivityValidation = [...companyIdValidation];

// Update time activity
export const updateTimeActivityValidation = [
	...companyIdValidation,
	body('timeActivityId').notEmpty().withMessage('Time Activity id is required'),
	body('hours').notEmpty().withMessage('Hours is required'),
	body('minute').notEmpty().withMessage('Minute is required'),
];

// Create time activity
export const createTimeActivityValidation = [
	...companyIdValidation,
	body('hours').notEmpty().withMessage('Hours is required'),
	body('minute').notEmpty().withMessage('Minute is required'),
	body('activityDate').notEmpty().withMessage('Activity Date is required'),
];

// Delete time activity
export const deleteTimeActivityValidation = [
	...companyIdValidation,
	body('timeActivityId').notEmpty().withMessage('Time Activity id is required'),
];

export const addConfigurationFieldValidation = [
	body('companyId').notEmpty().withMessage('Company id is required'),
	body('sectionId').notEmpty().withMessage('section id is required'),
	body('name').notEmpty().withMessage('Field name is required'),
	body('jsonId').notEmpty().withMessage('Json id is required'),
];

export const updateConfigurationFieldValidation = [
	body('fieldId').notEmpty().withMessage('Field id is required'),
	body('fieldName').notEmpty().withMessage('Field name is required'),
];

export const deleteConfigurationFieldValidation = [
	body('companyId').notEmpty().withMessage('Company id is required'),
	body('fieldId').notEmpty().withMessage('Field id is required'),
];

export const employeeCostCreateValidation = [
	body('companyId').notEmpty().withMessage('CompanyId is required'),
	body('date').notEmpty().withMessage('Date is required'),
];

export const employeeCostUpdateValidation = [
	body('employeeCostValueID')
		.notEmpty()
		.withMessage('Employee costID is required'),
	body('value').notEmpty().withMessage('value is required'),
];

export const createSplitTimeActivity = [
	body('parentActivityId')
		.notEmpty()
		.withMessage('Parent activity id is required'),
	body('employeeId').notEmpty().withMessage('Employee id is required'),
	body('timeActivityData.*.classId')
		.not()
		.isEmpty()
		.withMessage('Time activity data is not valid'),
	body('timeActivityData.*.customerId')
		.not()
		.isEmpty()
		.withMessage('Time activity data is not valid'),
	body('timeActivityData.*.className')
		.not()
		.isEmpty()
		.withMessage('Time activity data is not valid'),
	body('timeActivityData.*.customerName')
		.not()
		.isEmpty()
		.withMessage('Time activity data is not valid'),
	body('timeActivityData.*.hours')
		.not()
		.isEmpty()
		.withMessage('Time activity data is not valid'),
	body('timeActivityData.*.minute')
		.not()
		.isEmpty()
		.withMessage('Time activity data is not valid'),
	body('timeActivityData.*.activityDate')
		.not()
		.isEmpty()
		.withMessage('Time activity data is not valid'),
];

export const deleteSplitTimeActivity = [
	body('splitTimeActivityId')
		.notEmpty()
		.withMessage('Split time activity id is required'),
];

export const deleteAllSplitTimeActivity = [
	body('timeActivityId').notEmpty().withMessage('Time activity id is required'),
];

export const createTimeSheetValidator = [
	...companyIdValidation,
	// body('name').notEmpty().withMessage('Time sheet name is required'),
	// body('status').notEmpty().withMessage('Time sheet status is required'),
	// body('status')
	// 	.isIn(TimeSheetsStatus)
	// 	.withMessage('Time sheet status is invalid'),
	// body('notes').notEmpty().withMessage('Time sheet notes required'),
	body('payPeriodId').notEmpty().withMessage('Pay period id is required'),
];

export const payPeriodValidator = [
	...companyIdValidation,
	body('startDate').notEmpty().withMessage('Start date is required'),
	body('endDate').notEmpty().withMessage('End date is required'),
];

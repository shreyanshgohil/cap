import {
	EmailSvg,
	PasswordSvg,
	ConfigurationsSvg,
	// CustomRulesSvg,
	IntegrationsSvg,
	// SubscriptionSvg,
	RoleSvg,
	UsersSvg,
} from 'utils/svgs';

const phoneNumberValidator = (_: any, value: any) => {
	// Modify this regex pattern to match the format of phone numbers you want to validate
	const phoneRegex = /^[0-9]{10}$/;

	if (!value || value.match(phoneRegex)) {
		return Promise.resolve();
	}

	return Promise.reject(new Error('Please enter a valid phone number'));
};

const validateNoOnlySpaces = (_: any, value: any) => {
	if (value && value.trim() === '') {
		return Promise.reject('Please enter valid value');
	}
	return Promise.resolve();
};

export const FORMDATA = {
	loginFields: [
		{
			title: 'Email Address',
			id: 'email',
			type: 'text',
			name: 'email',
			svg: <EmailSvg />,
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter your email address',
					validateTrigger: 'onChange',
				},
				{
					type: 'email',
					message: 'Please enter valid e-mail',
					validateTrigger: 'onChange',
				},
			],
		},
		{
			title: 'Password',
			id: 'password',
			type: 'password',
			name: 'password',
			svg: <PasswordSvg />,
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter your password',
					validateTrigger: 'onChange',
				},
				// {
				// 	pattern:
				// 		/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,16}$/,
				// 	message:
				// 		'Password should have minimum 8 characters at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
				// 	validateTrigger: 'onChange',
				// },
			],
		},
	],
	resetPassword: [
		{
			title: 'New Password',
			id: 'password',
			type: 'password',
			name: 'password',
			svg: <PasswordSvg />,
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter your password',
					validateTrigger: 'onChange',
				},
				{
					pattern:
						/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,16}$/,
					message:
						'Password should have minimum 8 characters at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
					validateTrigger: 'onChange',
				},
			],
		},
		{
			title: 'Confirm Password',
			id: 'confirmPassword',
			type: 'password',
			name: 'confirmPassword',
			svg: <PasswordSvg />,
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter your password again',
					validationTrigger: 'onChange',
				},
				({ getFieldValue }: any) => ({
					validator(_: any, value: any) {
						if (!value || getFieldValue('password') === value) {
							return Promise.resolve();
						}
						return Promise.reject(new Error('Passwords do not match'));
					},
					validateTrigger: 'onChange',
				}),
			],
		},
	],
	forgotPassword: [
		{
			title: 'Email Address',
			id: 'email',
			type: 'text',
			name: 'email',
			svg: <EmailSvg />,
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter your email address',
					validateTrigger: 'onChange',
				},
				{
					type: 'email',
					message: 'Please enter valid e-mail',
					validateTrigger: 'onChange',
				},
			],
		},
	],
	settingsMenuItems: [
		{
			key: 'Users',
			icon: <UsersSvg />,
			label: 'Users',
		},
		{
			key: 'Roles',
			icon: <RoleSvg />,
			label: 'Roles',
		},
		{
			key: 'Integrations',
			icon: <IntegrationsSvg />,
			label: 'Integrations',
		},
		// {
		// 	key: 'Subscriptions',
		// 	icon: <SubscriptionSvg />,
		// 	label: 'Subscription',
		// },
		{
			key: 'Configurations',
			icon: <ConfigurationsSvg />,
			label: 'Configurations',
		},
		// {
		// 	key: 'CustomRules',
		// 	icon: <CustomRulesSvg />,
		// 	label: 'Custom Rules',
		// },
	],
	pageMenuItems: [
		{
			key: 'dashboard',
			label: 'Dashboard',
		},
		{
			key: 'employee-costs',
			label: 'Employee Costs',
		},
		{
			key: 'time-activity',
			label: 'Time Activity',
		},
		// {
		// 	key: 'journalEntries',
		// 	label: 'Journal Entries',
		// },
		// {
		// 	key: 'reports',
		// 	label: 'Reports',
		// },
	],
	addUserFields: [
		{
			title: 'Full Name',
			id: 'fullName',
			type: 'text',
			name: 'fullName',
			placeHolder: '',
			required: false,
			rules: [
				{
					max: 30,
					message: 'Full name length must be less than 30 characters',
					validateTrigger: 'onChange',
				},
				{ validator: validateNoOnlySpaces },
			],
		},
		{
			title: 'Select Role',
			id: 'roleName',
			type: 'text',
			name: 'roleName',
			defaultValue: '',
			placeholder: 'Enter role name',
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please select role',
					validateTrigger: 'onChange',
				},
			],
		},
		{
			title: 'Email Address',
			id: 'email',
			type: 'text',
			name: 'email',
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter email address',
					validateTrigger: 'onChange',
				},
				{
					type: 'email',
					message: 'Please enter valid email address',
					validateTrigger: 'onChange',
				},
			],
		},
		{
			title: 'Phone Number',
			id: 'phone',
			type: 'number',
			name: 'phone',
			placeHolder: '',
			required: false,
			rules: [{ validator: phoneNumberValidator, validateTrigger: 'onChange' }],
		},
	],
	addRoleFields: [
		{
			title: 'Role Name',
			id: 'roleName',
			type: 'text',
			name: 'roleName',
			defaultValue: '',
			placeholder: 'Enter role name',
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter role name',
					validateTrigger: 'onChange',
				},
				{
					max: 50,
					message: 'Role name length must be less than 50 characters',
					validateTrigger: 'onChange',
				},
				{ validator: validateNoOnlySpaces },
			],
		},
		{
			title: 'Description',
			id: 'roleDescription',
			type: 'textArea',
			name: 'roleDescription',
			defaultValue: '',
			placeholder: 'Enter role description',
			placeHolder: '',
			required: true,
			rules: [
				{
					required: true,
					message: 'Please enter role description',
					validateTrigger: 'onSubmit',
				},
				{
					max: 200,
					message: 'Role description length must be less than 200 characters',
					validateTrigger: 'onChange',
				},
				{ validator: validateNoOnlySpaces },
			],
		},
	],
};

export const userColumns = [
	{
		title: 'Organization Name',
		dataIndex: 'name',
		key: 'name',
		sorter: (a: any, b: any) => {
			return a.name.length - b.name.length;
		},
		sortDirections: ['descend'],
	},
	{
		title: 'Email Address',
		dataIndex: 'email',
		key: 'email',
	},
	{
		title: 'Phone number',
		dataIndex: 'phone',
		key: 'phone',
	},
	{
		title: 'Role',
		dataIndex: 'role',
		key: 'role',
	},
	{
		title: 'Action',
		dataIndex: 'action',
		key: 'action',
	},
];

export const roleDataSource: any = [];
roleDataSource.push({
	name: `Admin`,
	description: `Description for role`,
	permissions: `Permission Details`,
	status: true,
	action: `some action`,
});

for (let index = 0; index < 15; index++) {
	roleDataSource.push({
		name: `Role ${index}`,
		description: `Description for role ${index}`,
		permissions: `Permission Details`,
		status: index % 2 == 0 ? true : false,
		action: `some action`,
	});
}

export const roleColumns = [
	{
		title: 'Role Name',
		dataIndex: 'name',
		key: 'name',
		sorter: (a: any, b: any) => {
			return a.name.length - b.name.length;
		},
		sortDirections: ['descend'],
	},
	{
		title: 'Description',
		dataIndex: 'description',
		key: 'description',
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: 'Permissions',
		dataIndex: 'permissions',
		key: 'permissions',
	},
	{
		title: 'Action',
		dataIndex: 'action',
		key: 'action',
	},
];

export const PermissionDataSource: any = [
	{
		moduleName: 'Admin',
		isParentModule: true,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Dashboard',
		isParentModule: false,
		all: true,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Employee Cost',
		isParentModule: false,
		all: false,
		view: true,
		edit: true,
		delete: false,
	},
	{
		moduleName: 'Cost Allocation',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Journal Entries',
		isParentModule: false,
		all: false,
		view: true,
		edit: true,
		delete: false,
	},
	{
		moduleName: 'Time Activities',
		isParentModule: true,
		all: true,
		view: false,
		edit: false,
		delete: true,
	},
	{
		moduleName: 'TimeLogs',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'TimeSheets',
		isParentModule: false,
		all: false,
		view: true,
		edit: true,
		delete: true,
	},
	{
		moduleName: 'Settings',
		isParentModule: true,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Roles',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Users',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Integrations',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Configurations',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Subscriptions',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Custom Rules',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Reports',
		isParentModule: true,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Time Summary',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Payroll Summary',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
	{
		moduleName: 'Customer Overview',
		isParentModule: false,
		all: false,
		view: false,
		edit: false,
		delete: false,
	},
];

export const UserProfileData = [
	{
		title: 'First Name',
		id: 'firstName',
		type: 'text',
		name: 'firstName',
		defaultValue: '',
		disabled: false,
		errorMessage: 'Please enter your first name',
		required: true,
		rules: [
			{
				required: true,
				message: 'Please enter your first name',
				validateTrigger: 'onChange',
			},
			{
				max: 30,
				message: 'First name length must be less than 30 characters',
				validateTrigger: 'onChange',
			},
		],
	},
	{
		title: 'Last Name',
		id: 'lastName',
		type: 'text',
		name: 'lastName',
		defaultValue: '',
		disabled: false,
		errorMessage: 'Please enter your last name',
		required: true,
		rules: [
			{
				required: true,
				message: 'Please enter your last name',
				validateTrigger: 'onChange',
			},
			{
				max: 30,
				message: 'First name length must be less than 30 characters',
				validateTrigger: 'onChange',
			},
		],
	},
	{
		title: 'Email Address',
		id: 'email',
		type: 'text',
		name: 'email',
		defaultValue: '',
		disabled: true,
		errorMessage: 'Please enter your email',
		required: false,
		rules: [],
	},
	{
		title: 'Phone Number',
		id: 'phone',
		type: 'number',
		name: 'phone',
		defaultValue: '',
		disabled: false,
		errorMessage: 'Please enter your number',
		required: false,
		rules: [
			// {
			// 	required: true,
			// 	message: 'Please enter your number',
			// 	validateTrigger: 'onChange',
			// },
			{ validator: phoneNumberValidator, validateTrigger: 'onChange' },
		],
	},
];

export const permissionObject = [
	{
		items: [1, 2, 3, 4],
	},
	{
		name: 'Time Activities',
		items: [5, 6],
	},
	{
		name: 'Settings',
		items: [7, 8, 9, 10, 11, 12, 16],
	},
	{
		name: 'Reports',
		items: [13, 14],
	},
];
export const integrationsCards = [
	{
		title: 'Connect With Quickbooks Online',
		buttonText: 'Connect to Quickbooks',
		logo: '/assets/images/quickbooks-logo.png',
		ghost: false,
	},
];

export const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export const configurations = [
	{
		capMappingTitle: 'Expense Pools',
		qbMappingTitle: 'QuickBooks Class',
		addMore: false,
		editable: false,
		data: [
			{
				capColumnTitle: 'Salary Allocation Pool',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
			{
				capColumnTitle: 'Indirect Allocation Pool',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
		],
	},
	{
		capMappingTitle: 'Salary Expense Accounts',
		qbMappingTitle: 'QuickBooks Online Chart of Accounts',
		addMore: true,
		editable: true,
		data: [
			{
				capColumnTitle: 'Salary',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
			{
				capColumnTitle: 'Vacation / PTO - Payroll Taxes',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
		],
	},
	{
		capMappingTitle: 'Fringe expense',
		qbMappingTitle: '',
		addMore: true,
		editable: true,
		data: [
			{
				capColumnTitle: 'Health Insurance',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
			{
				capColumnTitle: 'Retirement',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
			{
				capColumnTitle: "Worker's Comp",
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
		],
	},
	{
		capMappingTitle: 'Payroll Taxes Expense',
		qbMappingTitle: '',
		addMore: true,
		editable: true,
		data: [
			{
				capColumnTitle: 'FICA - Payroll Taxes',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
			{
				capColumnTitle: 'SUI - Payroll Taxes',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
		],
	},
	{
		capMappingTitle: 'Indirect Expense Allocations',
		qbMappingTitle: '',
		addMore: true,
		editable: true,
		data: [
			{
				capColumnTitle: 'Indirect Allocations',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
		],
	},
	{
		capMappingTitle: 'Expense Pools Funding Source',
		qbMappingTitle: 'Quickbooks Customer',
		addMore: true,
		editable: true,
		data: [
			{
				capColumnTitle: 'General Operating',
				qbData: [
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
					{ title: 'Title 1 ' },
				],
			},
		],
	},
];

export const timeLogs = [
	{
		key: '1',
		dropdownIcon: '',
		activityDate: '10/20/30',
		employee: 'Employee 1',
		customer: `1-Reimbursement Grants: Tennesse
Grant: TN Grant (10/22-9/23)`,
		class: '1-Programs: 101-Community Service',
		hrs: '10:00',
		action: '',
	},
	{
		key: '2',
		dropdownIcon: '',
		activityDate: '10/20/30',
		employee: 'Employee 1',
		customer: `1-Reimbursement Grants: Tennesse
Grant: TN Grant (10/22-9/23)`,
		class: '1-Programs: 101-Community Service',
		hrs: '10:00',
		action: '',
	},
];

export const data = [];

import { AuthLayout } from 'components/Global/AuthLayout';
import GlobalLayout from 'layouts/Global';
import {
	ForgotPassword,
	Home,
	Login,
	ResetPassword,
	TimeActivity,
} from 'pages';
import EmployeeCosts from 'pages/EmployeeCosts';
import QuickbooksCallback from 'pages/QuickbooksCallback';
import Unauthorized from 'pages/Unauthorized';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
	{
		element: <AuthLayout />,
		children: [
			{
				path: '/',
				element: <GlobalLayout />,
				children: [
					{
						index: true,
						element: <Home />,
					},
					{
						path: 'time-activity',
						element: <TimeActivity />,
					},
					{
						path: 'employee-costs',
						element: <EmployeeCosts />,
					},
				],
			},
			{
				path: '/login',
				element: <Login />,
			},
			{
				path: '/reset-password',
				element: <ResetPassword />,
			},
			{
				path: '/forgot-password',
				element: <ForgotPassword />,
			},
			{
				path: '/callback',
				element: <QuickbooksCallback />,
			},
			{
				path: '/unauthorized',
				element: <Unauthorized />,
			},
		],
	},
]);

export default router;

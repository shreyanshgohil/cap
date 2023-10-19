import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { fetchProfileAction } from 'redux/action/profileAction';
import { getCompanies, getCompanyDetails } from 'redux/slice/companySlice';
import { AppDispatch } from 'redux/store';

const authorizedPath = [
	'/',
	'/employee-costs',
	'/time-activity'
]

// const publicPath = [
// 	'/login',
// 	'/reset-password',
// 	'/forgot-password',
// 	'/callback',
// 	'/unauthorized'
// ]

export const AuthLayout = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const location = useLocation();

	const path = window.location.pathname;

	useEffect(() => {
		// if (localStorage.getItem('accessToken')) {

		dispatch(fetchProfileAction())
			.unwrap()
			.then((res) => {
				dispatch(getCompanies(res));
				dispatch(getCompanyDetails(localStorage.getItem('companyId') || ''));
			})
			.catch(() => {
				if (!(path === '/forgot-password' || path === '/reset-password')) {
					navigate('/login');
				}
			});
		// }
	}, []);

	useEffect(() => {
		const token = localStorage.getItem('accessToken');

		if(authorizedPath.includes(location.pathname) && !token) {
			navigate('/login');
		}

	}, [location.pathname]);

	return <Outlet />;
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postApi } from 'redux/apis';
import styles from './index.module.scss';
import { toastText } from 'utils/utils';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { fetchProfileAction } from 'redux/action/profileAction';
import { getCompanies, getCompanyDetails } from 'redux/slice/companySlice';
import toast from 'react-hot-toast';

const QuickbooksCallback = () => {
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		setIsLoading(true);

		postApi('/quickbooks/callback', {
			url: window.location.href,
			companyId: localStorage.getItem('companyId') || null,
		})
			.then(() => {
				setIsLoading(false);
				dispatch(fetchProfileAction())
					.unwrap()
					.then((res) => {
						dispatch(getCompanies(res));
					})
					.then(() => {
						dispatch(getCompanyDetails(localStorage.getItem('companyId')));
					})
					.then(() => {
						localStorage.setItem('settings', 'Configurations');
						navigate('/?openDrawer=true');
					});
				localStorage.removeItem('qbUrl');
			})
			.catch((err: any) => {
				setIsLoading(false);
				if (err?.response?.data?.message === 'Can not connect this company') {
					toast.error(
						'You are trying to connect different companies. Please connect the same company that you have previously connected.',
						{
							style: {
								fontSize: '16px',
							},
							duration: 5000,
						}
					);
					setTimeout(() => {
						window.open(localStorage.getItem('qbUrl')!, '_self');
					}, 5000);
				} else {
					toastText(err?.response?.data?.message, 'error');
					navigate('/');
				}
			});
	}, []);

	return (
		<div className={styles['main-container']}>
			{isLoading && <img src="assets/gifs/loading-black.gif" />}
		</div>
	);
};

export default QuickbooksCallback;

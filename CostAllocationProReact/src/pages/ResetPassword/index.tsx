import { LoginLayoutBody } from 'components/Login';
import { FORMDATA } from 'constants/Data';
import { RegistrationLayout } from 'layouts';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postApi } from 'redux/apis';
import { toastText } from 'utils/utils';

// Login page
const ResetPassword = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const first = searchParams.get('first');

	// State Management
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		verifyToken();
	}, []);

	// Verify Token Api
	const verifyToken = () => {
		setIsLoading(true);
		postApi(`/auth/verify-forgot-password?token=${token}`)
			.then(() => {
				setIsLoading(false);
			})
			.catch(() => {
				toastText('This link has expired', 'error');
				setIsLoading(false);
				navigate('/login');
			});
	};

	const onSubmit = (values: any) => {
		setIsLoading(true);
		postApi(`/auth/change-password/${token}`, values)
			.then((res) => {
				if (first) {
					toastText('Password generated successfully', 'success');
				} else {
					toastText(res?.data?.message, 'success');
				}
				setIsLoading(false);
				navigate('/login');
			})
			.catch((err) => {
				toastText(err?.response?.data?.message, 'error');
				setIsLoading(false);
			});
	};

	// JSX
	return (
		<RegistrationLayout>
			<LoginLayoutBody
				title={first == 'true' ? 'Set Password' : 'Reset Password'}
				formData={FORMDATA.resetPassword}
				buttonTitle={'Set Password'}
				onSubmit={onSubmit}
				isLoading={isLoading}
				redirectUrl="/login"
				redirectText="Back to login"
			></LoginLayoutBody>
		</RegistrationLayout>
	);
};

export default ResetPassword;

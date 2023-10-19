import { LoginLayoutBody } from 'components/Login';
import { RegistrationLayout } from 'layouts';
import { FORMDATA } from 'constants/Data';
import { loginAction } from 'redux/slice/loginSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCompanies } from 'redux/slice/companySlice';
import { useState } from 'react';
import { fetchProfileAction } from 'redux/action/profileAction';

// Login page
const Login = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = (values: any) => {
		setIsLoading(true);
		localStorage.clear();
		dispatch(loginAction(values) as any)
			.unwrap()
			.then(() => {
				dispatch(fetchProfileAction() as any)
					.unwrap()
					.then((res: any) => {
						setIsLoading(false);
						dispatch(getCompanies(res));
						navigate('/');
					});
			})
			.catch(() => {
				setIsLoading(false);
				navigate('/login');
			});
	};
	// JSX
	return (
		<RegistrationLayout>
			<LoginLayoutBody
				title="Login"
				description="<p>
							Welcome to <strong> CostAllocation Pro! </strong>Please Enter your
							Details.
						</p>"
				formData={FORMDATA.loginFields}
				buttonTitle={'Sign in'}
				action={loginAction}
				redirectUrl="/forgot-password"
				redirectText="Forgot password?"
				onSubmit={onSubmit}
				isLoading={isLoading}
			></LoginLayoutBody>
		</RegistrationLayout>
	);
};

export default Login;

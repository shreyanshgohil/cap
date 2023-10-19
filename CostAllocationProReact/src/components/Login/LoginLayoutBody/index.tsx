import { Button, Form } from 'antd';
import { InputWithLabelAndSvg } from 'components/Global';
import { FC } from 'react';
import styles from './index.module.scss';
import { LoginLayoutBodyProps } from './types';
import { useNavigate } from 'react-router-dom';

// Login layout body designing
const LoginLayoutBody: FC<LoginLayoutBodyProps> = (props) => {
	// Inits
	const {
		title,
		description,
		formData: loginFields,
		buttonTitle,
		// action,
		redirectText,
		redirectUrl,
		onSubmit,
		isLoading,
	} = props;

	const navigate = useNavigate();

	// JSX
	return (
		<div className={styles['login-body']}>
			<Form
				className={styles['login-body__wrapper']}
				name="basic"
				onFinish={onSubmit}
			>
				<div className={styles['login-body__top']}>
					<h4 className={styles['login-body__top--title']}>{title}</h4>
					{description && (
						<div className={styles['login-body__top--description']}>
							<p dangerouslySetInnerHTML={{ __html: description }} />
						</div>
					)}
				</div>
				<div className={styles['login-body__center']}>
					{loginFields.map((singleUserInput, key) => {
						return (
							<InputWithLabelAndSvg
								key={key}
								singleUserInput={singleUserInput}
							/>
						);
					})}
				</div>

				<p
					className={styles['login-body__forgot-password']}
					onClick={() => navigate(`${redirectUrl}`)}
				>
					{redirectText}
				</p>

				<div className={styles['login-body__end']}>
					<Button
						type="primary"
						className={`${styles['login-body__end--button']} ${
							isLoading && 'pointer-event-none'
						}`}
						size="large"
						htmlType="submit"
						// disabled={isLoading}
					>
						{isLoading ? (
							<img src="assets/gifs/loading-black.gif" height={40} />
						) : (
							<>{buttonTitle}</>
						)}
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default LoginLayoutBody;

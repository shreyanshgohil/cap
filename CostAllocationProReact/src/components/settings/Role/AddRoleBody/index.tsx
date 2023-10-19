import { Button, Form, Input } from 'antd';
import { FORMDATA } from 'constants/Data';
import { FC } from 'react';
import styles from './index.module.scss';
import './index.scss';
import { SideDrawerBodyProps } from './types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import {
	addRoleActionTable,
	editRoleActionTable,
} from 'redux/action/roleTableAction';

const AddRoleBody: FC<SideDrawerBodyProps> = (props) => {
	const { addRoleFields } = FORMDATA;

	// Inits
	const {
		closeDrawerByAnimation,
		editSelectedRole,
		// setEditSelectedRole
	} = props;

	const dispatch = useDispatch<AppDispatch>();

	const { isLoading } = useSelector((state: any) => state?.roleTable);

	// If form get success
	const onFinish = (values: any) => {
		if (editSelectedRole) {
			const data = {
				roleId: editSelectedRole?.id,
				roleName: values?.roleName,
				roleDescription: values?.roleDescription,
			};
			dispatch(editRoleActionTable(data)).then(() => {
				closeDrawerByAnimation();
			});
		} else {
			dispatch(addRoleActionTable(values)).then((res: any) => {
				if (res?.payload?.error?.status === 400) {
					return;
				} else {
					closeDrawerByAnimation();
				}
			});
		}
	};

	// If form fails
	const onFinishFailed = () => {
		// console.log('');
	};

	return (
		<div className={styles['side-drawer-body']}>
			<Form
				name="basic"
				initialValues={editSelectedRole}
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
				autoComplete="off"
				layout="vertical"
				labelAlign="left"
				className={styles['side-drawer-form']}
			>
				<div className={styles['side-drawer-form__inputs']}>
					{addRoleFields.map((singleField, index) => {
						return (
							<div
								key={index}
								className={styles['side-drawer-form__single-input']}
							>
								<label
									className={styles['side-drawer-form__single-input--label']}
								>
									{singleField?.title}{' '}
									{singleField?.required && (
										<span className="required-color">*</span>
									)}
								</label>
								{singleField.type == 'textArea' ? (
									<Form.Item
										name={singleField.name}
										className={`${styles['side-drawer-form__single-input--input']} text-area-error`}
										rules={singleField.rules as []}
									>
										<textarea
											className={
												styles['side-drawer-form__single-input--textarea']
											}
											placeholder={singleField.placeholder}
										/>
									</Form.Item>
								) : (
									<Form.Item
										name={singleField.name}
										className={styles['side-drawer-form__single-input--input']}
										rules={singleField.rules as []}
									>
										<Input
											placeholder={singleField.placeholder}
											size="large"
											type={singleField.type}
										/>
									</Form.Item>
								)}
							</div>
						);
					})}
				</div>
				<div className={styles['side-drawer-form__buttons']}>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							size="large"
							className={`${styles['side-drawer-form__save']} ${
								isLoading && 'pointer-event-none'
							} `}
						>
							{isLoading ? (
								<img src="/assets/gifs/loading-black.gif" height={40} />
							) : (
								'Save'
							)}
						</Button>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="button"
							size="large"
							className={styles['side-drawer-form__cancel']}
							onClick={() => {
								closeDrawerByAnimation();
							}}
						>
							Cancel
						</Button>
					</Form.Item>
				</div>
			</Form>
		</div>
	);
};

export default AddRoleBody;

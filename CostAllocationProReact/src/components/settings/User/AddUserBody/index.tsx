import { Form, Input, Select } from 'antd';
import { InputWithLabelAndSvg } from 'components/Global';
import InputWithLabelAndSvgStyles from 'components/Global/InputWithLabel/index.module.scss';
import { FORMDATA } from 'constants/Data';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editUserAction, inviteUserAction } from 'redux/action/userAction';
import { AppDispatch } from 'redux/store';
import { phoneNumberFormatHandler } from 'utils/utils';
import styles from './index.module.scss';
import { SideDrawerBodyProps } from './types';
const AddUserBody: FC<SideDrawerBodyProps> = (props) => {
	// Inits
	const { addUserFields } = FORMDATA;

	const { closeDrawerByAnimation, editSelectedUser } = props;
	const editData = {
		...editSelectedUser,
		fullName: editSelectedUser?.name || '',
		phone: editSelectedUser?.simplePhone,
	};

	// State Management
	const [roleOptions, setRoleOptions] = useState([]);
	const [selectedRole, setSelectedRole] = useState(null);
	const [isSelected, setIsSelected] = useState<boolean>();
	const [phoneNumber, setPhoneNumber] = useState<any>(
		phoneNumberFormatHandler(editData.phone || '') || ''
	);
	const [phoneNumberWithoutUsFormat, setPhoneNumberWithoutUsFormat] =
		useState<any>(editData.phone || '');

	const dispatch = useDispatch<AppDispatch>();
	const { data: roleData } = useSelector((state: any) => state?.roles);

	const { isLoading } = useSelector((state: any) => state?.users);

	useEffect(() => {
		const data = roleData?.map((role: any) => {
			return {
				value: role.id,
				label: role.roleName,
			};
		});
		setRoleOptions(data);
	}, [roleData]);

	// If form get success
	const onFinish = (values: any) => {
		if (
			phoneNumberWithoutUsFormat?.length === 0 ||
			phoneNumberWithoutUsFormat?.length === 10
		) {
			const fullName = values.fullName as string;
			const nameArray = fullName.split(' ');
			const firstName = nameArray.slice(0, 1).join(' ') || '';
			const lastName = nameArray.slice(1, nameArray.length).join(' ') || '';
			if (editSelectedUser) {
				let data: any = {
					userId: editSelectedUser?.userId,
					phone: phoneNumberWithoutUsFormat,
					firstName,
					lastName,
				};

				if (selectedRole) {
					data = {
						...data,
						roleId: selectedRole,
						isChangeStatus: false,
					};
				}

				dispatch(editUserAction(data)).then(() => {
					closeDrawerByAnimation();
				});
			} else {
				if (selectedRole) {
					setIsSelected(true);
					const finalData = {
						email: values.email,
						role: selectedRole,
						phone: phoneNumberWithoutUsFormat,
						// phone: values?.phone,
						firstName,
						lastName,
					};

					dispatch(inviteUserAction(finalData)).then((res: any) => {
						if (res?.payload?.error?.status === 404) {
							return;
						} else {
							closeDrawerByAnimation();
						}
					});
				} else {
					setIsSelected(false);
				}
			}
		}
	};

	// If form fails
	const onFinishFailed = () => {
		if (selectedRole) {
			setIsSelected(true);
		} else {
			setIsSelected(false);
		}
	};

	// For handle the phone number change
	const phoneChangeHandler = (phone: any) => {
		const normalNumber = phone.replace(/\D/g, '');
		if (normalNumber?.length <= 10) {
			const phoneNo = phoneNumberFormatHandler(phone);
			setPhoneNumberWithoutUsFormat(normalNumber);
			setPhoneNumber(phoneNo);
		}
	};

	// JSX
	return (
		<div className={styles['side-drawer-body']}>
			<Form
				name="basic"
				initialValues={editData}
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
				autoComplete="off"
				layout="vertical"
				labelAlign="left"
				className={styles['side-drawer-form']}
			>
				<div className={styles['side-drawer-form__inputs']}>
					{addUserFields.map((singleField: any, index) => {
						return (
							<React.Fragment key={index}>
								{singleField.id !== 'roleName' ? (
									index !== 3 ? (
										<InputWithLabelAndSvg
											singleUserInput={singleField}
											disabled={
												singleField?.name == 'email' && editSelectedUser && true
											}
											focus={index === 0 ? true : false}
										/>
									) : (
										<div className={InputWithLabelAndSvgStyles['input-icon']}>
											<div
												className={
													InputWithLabelAndSvgStyles['input-icon__title']
												}
											>
												{singleField.svg && (
													<div
														className={
															InputWithLabelAndSvgStyles[
																'input-icon__title--svg'
															]
														}
													>
														{singleField.svg}
													</div>
												)}
												<label
													className={
														InputWithLabelAndSvgStyles[
															'input-icon__title--label'
														]
													}
												>
													{singleField.title}
													{singleField?.required && (
														<span className="required-color">*</span>
													)}
												</label>
											</div>
											<div
												className={
													InputWithLabelAndSvgStyles['input-icon__form']
												}
											>
												<Form.Item>
													{(singleField.type === 'text' ||
														singleField.type === 'number') && (
														<Input
															placeholder={singleField.placeHolder}
															size="large"
															value={phoneNumber}
															onChange={(e) =>
																phoneChangeHandler(e.target.value)
															}
															className={
																InputWithLabelAndSvgStyles[
																	'input-icon__form--input'
																]
															}
														/>
													)}
													{phoneNumberWithoutUsFormat?.length !== 10 &&
														phoneNumberWithoutUsFormat?.length !== 0 && (
															<p className="error-message">
																Please enter a valid phone number
															</p>
														)}
												</Form.Item>
											</div>
										</div>
									)
								) : (
									<Form.Item
										className="side-drawer-form__role"
										name={singleField.name}
									>
										<label className={styles['side-drawer-form__role--label']}>
											{singleField.title}{' '}
											{singleField?.required && (
												<span className="required-color">*</span>
											)}
										</label>
										<Select
											placeholder="Select Role"
											className={styles['side-drawer-form__role--select']}
											size="large"
											onSelect={(role) => {
												setSelectedRole(role);
												setIsSelected(true);
											}}
											defaultValue={
												editSelectedUser && editSelectedUser?.roleId
											}
										>
											{roleOptions?.map((role: any, key) => {
												return (
													<Select.Option value={role?.value} key={key}>
														{role?.label}
													</Select.Option>
												);
											})}
										</Select>
										{isSelected == false && (
											<p className="ant-form-item-explain-error">
												Please select role
											</p>
										)}
									</Form.Item>
								)}
							</React.Fragment>
						);
					})}
				</div>
				<div className={styles['side-drawer-form__buttons']}>
					<Form.Item>
						<button
							className={`${styles['side-drawer-form__buttons--save']} ${
								isLoading && 'pointer-event-none'
							}`}
						>
							{isLoading ? (
								<img src="/assets/gifs/loading-black.gif" height={40} />
							) : (
								'Save'
							)}
						</button>
					</Form.Item>
					<Form.Item>
						<button
							className={`${styles['side-drawer-form__buttons--cancel']}`}
							onClick={closeDrawerByAnimation}
							disabled={isLoading}
						>
							Cancel
						</button>
					</Form.Item>
				</div>
			</Form>
		</div>
	);
};

export default AddUserBody;

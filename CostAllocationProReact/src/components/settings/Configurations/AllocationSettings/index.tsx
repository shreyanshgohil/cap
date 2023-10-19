import { Form, InputNumber, Radio, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import styles from './index.module.scss';
import './index.scss';
import { AllocationSettingsProps } from './types';

// Allocation settings component
const AllocationSettings: FC<AllocationSettingsProps> = (props) => {
	const {
		settingsData,
		changePayrollMethodHandler,
		payrollMethod,
		indirectExpenseRate,
		changeExpenseRateAllocationHandler,
		settingsChangeHandler,
	} = props;

	const [filteredSettingsData, setFilteredSettingsData] = useState({});

	useEffect(() => {
		const newData = JSON.parse(JSON.stringify(settingsData));
		delete newData['0'];
		delete newData['4'];
		delete newData['5'];
		setFilteredSettingsData(newData);
	}, [settingsData]);

	// JSX
	return (
		<div className={styles['account-settings']}>
			<div className={styles['account-settings__wrapper']}>
				<div className={styles['account-settings__top']}>
					<p className={styles['account-settings__top--title']}>
						Allocations Settings
					</p>
				</div>
				<div className={styles['account-settings__center']}>
					<div className={styles['account-settings__center--expense']}>
						<label
							className={styles['account-settings__center--expense--label']}
						>
							The rate for allocating Indirect Expenses
						</label>
						<InputNumber
							className={styles['account-settings__center--expense--input']}
							min={0}
							max={100}
							defaultValue={indirectExpenseRate}
							value={indirectExpenseRate}
							onChange={changeExpenseRateAllocationHandler}
							addonAfter="%"
							size="large"
						/>
					</div>

					<Form.Item name={'percentage'}>
						<div className={styles['account-settings__center--expense']}>
							<label
								className={styles['account-settings__center--expense--label']}
							>
								Method of Payroll Allocations
							</label>
							<Select
								className={styles['account-settings__center--expense--input']}
								value={payrollMethod}
								disabled={true}
								placeholder="Select Role"
								size="large"
								onChange={changePayrollMethodHandler}
								defaultValue={payrollMethod}
							>
								<Select.Option value={'Percentage'}>Percentage</Select.Option>
								{/* <Select.Option value={'Hours'}>Hours</Select.Option> */}
							</Select>
						</div>
					</Form.Item>
				</div>

				{payrollMethod === 'Hours' && (
					<div className={styles['account-settings__bottom']}>
						<div className={styles['account-settings__bottom--title']}>
							<p>Rates limited for Salaried-Non-Exempt and Hourly employees</p>
						</div>
						{Object.values(filteredSettingsData).map(
							(singleSettingsObj: any) => {
								return Object.values(singleSettingsObj.fields).map(
									(field: any, index: number) => {
										return (
											<div
												className={styles['account-settings__bottom--select']}
												key={index}
											>
												<p>{field.label}</p>
												<Radio.Group
													defaultValue={field.ratesLimited}
													onChange={(event) =>
														settingsChangeHandler({
															sectionId: singleSettingsObj.id,
															fieldId: field.id,
															fieldName: 'ratesLimited',
															dataId: event.target.value,
														})
													}
												>
													<Radio value={true}>Yes</Radio>
													<Radio value={false}>No</Radio>
												</Radio.Group>
											</div>
										);
									}
								);
							}
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default AllocationSettings;

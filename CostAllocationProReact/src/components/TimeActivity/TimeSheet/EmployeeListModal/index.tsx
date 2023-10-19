import { Button, Col, Form, Modal, Row, Table, Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import { CloseSvg, EmailSvg, EmailWhite, ExportPdfWhite } from 'utils/svgs';
import styles from './index.module.scss';
import './index.scss';
import { EmployeeListModalProps } from './types';

const EmployeeListModal = (timeSheetData: EmployeeListModalProps) => {
	const { Column } = Table;
	const { selectedTimeSheet, timeSheetEmployeesData, closeEmployeeModal } =
		timeSheetData;
	const [form] = Form.useForm();

	const [employeeData, setEmployeeData] = useState([]);

	const handleSubmit = () => {
		console.log('Submit', employeeData);
	};

	const handleCancel = () => {
		closeEmployeeModal();
	};

	const handleCheckbox = (value: any, all: boolean, data?: any) => {
		if (all) {
			const finalData: any = employeeData?.map((singleEmployee: any) => {
				return {
					...singleEmployee,
					selected: value,
				};
			});

			setEmployeeData(finalData);
		} else {
			const finalData: any = employeeData?.map((singleEmployee: any) => {
				if (singleEmployee.employeeId === data?.employeeId) {
					return {
						...singleEmployee,
						selected: value,
					};
				} else {
					return singleEmployee;
				}
			});
			setEmployeeData(finalData);
		}
	};

	const handleSingleMail = (value: string, data: any) => {
		console.log('VAL: ', value, data);
	};

	useEffect(() => {
		const data = timeSheetEmployeesData.map((singleEmp: any) => {
			return {
				...singleEmp,
				key: singleEmp.employeeId,
				selected: false,
			};
		});
		setEmployeeData(data);
	}, [timeSheetEmployeesData]);

	return (
		<Modal
			open={true}
			onCancel={handleCancel}
			okText={'Save'}
			closable={false}
			footer={null}
			className="time-sheet-modal profile__popup"
		>
			<Form
				name="basic"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				style={{ maxWidth: 600 }}
				autoComplete="off"
				onFinish={handleSubmit}
				form={form}
			>
				<Row className={styles['time-sheet-modal__header']}>
					<div className="userDetailsTitle">
						<b>{selectedTimeSheet.name}</b>
					</div>
					<div
						className={styles['time-sheet-modal__header-delete']}
						onClick={handleCancel}
					>
						<CloseSvg />
					</div>
				</Row>
				<hr />
				<div className="time-sheet-modal__body">
					<Table
						dataSource={employeeData}
						scroll={{ y: '50vh' }}
						pagination={false}
						className="employee-list-modal"
					>
						<Column
							title={
								<Checkbox
									onChange={(e) => {
										handleCheckbox(e.target.checked, true);
									}}
								/>
							}
							key="selected"
							dataIndex="selected"
							width={'50px'}
							className="bg-white"
							render={(value: boolean, data: any) => {
								return (
									<Checkbox
										onChange={(e) =>
											handleCheckbox(e.target.checked, false, data)
										}
										checked={value}
										defaultChecked={value}
									/>
								);
							}}
						/>
						<Column
							title="Employee"
							dataIndex="employeeName"
							key="employeeName"
							className="bg-white"
						/>
						<Column
							title="Hrs"
							dataIndex="approvedHours"
							key="approvedHours"
							width={'80px'}
							className="bg-white"
						/>
						<Column
							title="Email"
							dataIndex="email"
							key="email"
							className="bg-white"
							render={(value: string, data: any) => (
								<Button
									className={styles['time-sheet-modal__body__button']}
									block={true}
									onClick={() => handleSingleMail(value, data)}
								>
									<EmailSvg />
									Send
								</Button>
							)}
						/>
					</Table>
				</div>
				<div className="time_sheet_modal_footer">
					<Row
						justify="start"
						className={styles['time-sheet-modal__body__buttons']}
						gutter={16}
					>
						<Col xs={12} md={7} lg={7} sm={8}>
							<Button
								className={styles['time-sheet-modal__body__send-email']}
								block={true}
								onClick={handleSubmit}
							>
								<EmailWhite />
								Send Email
							</Button>
						</Col>
						<Col xs={12} md={7} lg={7} sm={8}>
							<Button
								className={styles['time-sheet-modal__body__export']}
								htmlType="submit"
							>
								<ExportPdfWhite />
								Export as PDF
							</Button>
						</Col>
					</Row>
				</div>
			</Form>
		</Modal>
	);
};

export default EmployeeListModal;

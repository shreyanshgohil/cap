import { useState } from 'react';
// import EmployeeCostSelector from '../EmployeeCostSelector';
// import HoursSetup from '../HoursSetup';
import DynamicTable from '../Table';
import PayPeriod from 'components/settings/PayPeriods';
import { Tabs } from 'antd';
import './index.scss';
import { checkPermission } from 'utils/utils';
import { useSelector } from 'react-redux';
// import { useSelector } from 'react-redux';

const EmployeeCosts = () => {
	const [isEmployeeCost, setIsEmployeeCost] = useState('1');
	let items = [];

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const changeEmployeeCost = (isEmployeeCost: string) => {
		setIsEmployeeCost(isEmployeeCost);
	};

	const isViewPayPeriodPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Pay Period',
		permission: ['view'],
	});

	if (isViewPayPeriodPermission) {
		items = [
			{
				key: '1',
				label: 'Employee Cost',
				children: <DynamicTable />,
			},
			{
				key: '2',
				label: 'Pay Period',
				children: <PayPeriod changeEmployeeCost={changeEmployeeCost} />,
			},
		];
	} else {
		items = [
			{
				key: '1',
				label: 'Employee Cost',
				children: <DynamicTable />,
			},
		];
	}

	// const payrollMethod = useSelector(
	// 	(state: any) => state?.companies?.configurations?.payrollMethod
	// );

	return (
		<div>
			<Tabs
				defaultActiveKey="2"
				items={items}
				activeKey={isEmployeeCost}
				key={isEmployeeCost}
				tabBarStyle={{
					paddingLeft: '20px',
					fontSize: '18px',
				}}
				onChange={(e) => {
					setIsEmployeeCost(e);
				}}
				//indicatorSize={(origin) => origin - 16}
			/>
			{/* <EmployeeCostSelector
				changeEmployeeCost={changeEmployeeCost}
				isEmployeeCost={true}
			/>
			{!isEmployeeCost ? (
				<DynamicTable />
			) : (
				<PayPeriod changeEmployeeCost={changeEmployeeCost} />
			)} */}
		</div>
	);
};

export default EmployeeCosts;

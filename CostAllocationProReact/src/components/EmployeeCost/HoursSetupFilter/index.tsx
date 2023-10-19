import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select, Space } from 'antd';
import { SyncNow } from 'components/Global';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { checkPermission } from 'utils/utils';
import styles from './index.module.scss';

const HoursSetupFilter = (props: any) => {
	const { searchHandler, searchValue } = props;
	// const [selectedMonth, setSelectedMonth] = useState(new Date());

	const employeeLastSyncDate = useSelector(
		(state: any) =>
			state?.companies?.selectedCompanyDetails?.company?.employeeLastSyncDate
	);

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isAddEmployeeCostPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Employee Cost',
			permission: ['add'],
		}
	);

	const isEditEmployeeCostPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Employee Cost',
			permission: ['edit'],
		}
	);

	const [lastSyncTime, setLastSyncTime] = useState(new Date());
	const [syncLoading, setSyncLoading] = useState(false);

	useEffect(() => {
		setLastSyncTime(employeeLastSyncDate);
	}, [employeeLastSyncDate]);

	const handleSync = () => {
		setSyncLoading(true);
		// postApi(`/employees/sync`, {
		// 	companyId: localStorage.getItem('companyId'),
		// })
		// 	.then((data) => {
		// 		dispatch(
		// 			getEmployeeCostAction({
		// 				page: 1,
		// 				limit: 10,
		// 				sort: 'asc',
		// 				date: selectedMonth,
		// 			})
		// 		);
		// 		dispatch(employeeCostSyncDate());
		// 		toastText(data.data?.message, 'success');
		// 		setSyncLoading(false);
		// 	})
		// 	.catch((err:any) => {
		// 		toastText(err?.response?.data?.message, 'error');
		// 		setSyncLoading(false);
		// 	});
	};

	return (
		<Row>
			<Col className={styles['search-filter-main']}>
				<div className={styles['search-filter-main-picker']}>
					<Space className={styles['search-filter']}>
						<Input
							className={styles['search-filter__search']}
							placeholder="Search here..."
							suffix={<SearchOutlined />}
							onChange={searchHandler}
							size="large"
							value={searchValue}
							defaultValue={searchValue}
						/>
					</Space>
					<div className={styles['search-filter-main-date']}>
						<Select
							className={styles['search-filter__filter']}
							style={{ width: 200 }}
							// onChange={(value) => performFilterHandler('customerId', value)}
							size="large"
							placeholder="Select Financial Year"
							// value={filterValue?.customerId}
						>
							<Select.Option value="">Select Financial Year</Select.Option>
							<Select.Option>Jan 2022- Dec 2022</Select.Option>
							<Select.Option>Jan 2022- Dec 2022</Select.Option>
							<Select.Option>Jan 2022- Dec 2022</Select.Option>
						</Select>
					</div>
				</div>
				<div className={styles['search-filter-second']}>
					{(isAddEmployeeCostPermission || isEditEmployeeCostPermission) && (
						<Space className={styles['search-filter']}>
							<SyncNow
								syncDate={lastSyncTime}
								tooltip="Sync Now"
								handleSync={handleSync}
								isLoading={syncLoading}
							/>
						</Space>
					)}
				</div>
			</Col>
		</Row>
	);
};

export default HoursSetupFilter;

import { SearchOutlined } from '@ant-design/icons';
import { Col, DatePicker, Input, Row, Select, Space } from 'antd';
import { SyncNow } from 'components/Global';
import ExportData from 'components/Global/ExportData';
import moment from 'moment';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeCostAction } from 'redux/action/employeeCostAction';
import { postApi } from 'redux/apis';
import { employeeCostSyncDate } from 'redux/slice/companySlice';
import { AppDispatch } from 'redux/store';
import { checkPermission, toastText } from 'utils/utils';
import styles from './index.module.scss';
import { Next, Previous } from 'utils/svgs';

const SearchAndFilter = ({
	searchValue,
	onChangeSearchValue,
	dateRangeDateHandler,
	payPeriodDateRange,
	onSavePayPeriod,
	onChangePayPeriodId,
	payPeriodId,
	onSyncEmployee,
}: ISearchAndFilter) => {
	// const [selectedMonth, setSelectedMonth] = useState(new Date());
	const dispatch = useDispatch<AppDispatch>();

	const selectRef: any = useRef(null);

	const employeeLastSyncDate = useSelector(
		(state: any) =>
			state?.companies?.selectedCompanyDetails?.company?.employeeLastSyncDate
	);

	const employeeCosts = useSelector((state: any) => state?.employeeCosts?.data);
	const isPayPeriodLoading = useSelector(
		(state: any) => state?.payPeriods?.createdPayPeriodLoading
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

	const isAddPayPeriodPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Pay Period',
		permission: ['add'],
	});

	const [lastSyncTime, setLastSyncTime] = useState(new Date());
	const [syncLoading, setSyncLoading] = useState(false);
	const [payPeriodIndex, setPayPeriodIndex] = useState(null);

	useEffect(() => {
		const index = payPeriods.findIndex(
			(singlePayPeriod: any) => singlePayPeriod.id === payPeriodId
		);
		setPayPeriodIndex(index);
	}, [payPeriodId]);

	useEffect(() => {
		setLastSyncTime(employeeLastSyncDate);
	}, [employeeLastSyncDate]);

	const handleSync = () => {
		setSyncLoading(true);
		postApi(`/employees/sync`, {
			companyId: localStorage.getItem('companyId'),
		})
			.then((data) => {
				dispatch(
					getEmployeeCostAction({
						page: 1,
						limit: 10,
						sort: 'asc',
					})
				);
				dispatch(employeeCostSyncDate());
				toastText(data.data?.message, 'success');
				setSyncLoading(false);
				onSyncEmployee && onSyncEmployee();
			})
			.catch((err) => {
				toastText(err?.response?.data?.message, 'error');
				setSyncLoading(false);
			});
	};

	// const monthHandler = (value: any) => {
	// 	setSelectedMonth(value?.$d);
	// 	dispatch(changeSelectedMonth(value?.$d));
	// };

	// const handlePreviousDate = () => {
	// 	// const currentDate = new Date();
	// 	const previousMonth = new Date(selectedMonth);
	// 	previousMonth.setMonth(selectedMonth?.getMonth() - 1);
	// 	setSelectedMonth(previousMonth);
	// 	dispatch(changeSelectedMonth(previousMonth));
	// };

	// const handleNextDate = () => {
	// 	// const currentDate = new Date();
	// 	const nextMonth = new Date(selectedMonth);
	// 	nextMonth.setMonth(selectedMonth?.getMonth() + 1);
	// 	setSelectedMonth(nextMonth);
	// 	dispatch(changeSelectedMonth(nextMonth));
	// };

	const { RangePicker } = DatePicker;

	const handleSavePayPeriod = async () => {
		onSavePayPeriod && onSavePayPeriod();
	};

	const handleChangePayPeriodId = (id: any) => {
		onChangePayPeriodId && onChangePayPeriodId(id);
	};

	const payPeriods = useSelector((state: any) => state?.payPeriods?.optionData);

	const previousPayPeriodHandler = () => {
		if (payPeriods && payPeriods.length > 0) {
			const index = payPeriods.findIndex(
				(singlePayPeriod: any) => singlePayPeriod.id === payPeriodId
			);

			if (payPeriods[index - 1]) {
				onChangePayPeriodId(payPeriods[index - 1]?.id);
				setPayPeriodIndex(index);
			}
		}
	};
	const nextPayPeriodHandler = () => {
		if (payPeriods && payPeriods.length > 0) {
			const index = payPeriods.findIndex(
				(singlePayPeriod: any) => singlePayPeriod.id === payPeriodId
			);
			if (payPeriods[index + 1]) {
				onChangePayPeriodId(payPeriods[index + 1]?.id);
				setPayPeriodIndex(index);
			}
		}
	};

	const handleChangeSearchValue = (value: any) => {
		onChangeSearchValue && onChangeSearchValue(value);
	}

	return (
		<Row>
			<Col className={styles['search-filter-main']}>
				<div className={styles['search-filter-main-picker']}>
					<Space className={styles['search-filter']}>
						<Input
							className={styles['search-filter__search']}
							placeholder="Search here..."
							suffix={<SearchOutlined />}
							onChange={(e) => {
								handleChangeSearchValue(e.target.value);
							}}
							size="large"
							value={searchValue}
							defaultValue={searchValue}
						/>
					</Space>
					<div className={styles['search-filter-main-pay-period']}>
						<div
							className={`${styles[`search-filter-main-prev`]} ${
								payPeriods &&
								(payPeriods.length === 0 || payPeriods.length === 1)
									? 'pointer-event-none'
									: ''
							} 
							${payPeriodIndex == 0 && 'pointer-event-none'}
							`}
							onClick={previousPayPeriodHandler}
						>
							<Previous />
							Prev
						</div>
						<Select
							className={styles['pay-period-filter']}
							onChange={(value) => handleChangePayPeriodId(value)}
							size="large"
							placeholder="Pay Periods"
							value={payPeriodId}
							ref={selectRef}
							showSearch
							filterOption={(input, option: any) => {
								if (option.key) {
									const dateArr = option?.children?.filter(
										(singleOption: any) =>
											singleOption !== ' -' && singleOption !== ' '
									);
									const finalDate = dateArr.join(' - ');

									if (finalDate.includes(input)) {
										return option;
									}
								}
							}}
						>
							{payPeriods?.map((singlePayPeriod: any, index: number) => {
								return (
									<Select.Option value={singlePayPeriod?.id} key={index}>
										{moment(singlePayPeriod.startDate).format('MM/DD/YYYY')} -{' '}
										{moment(singlePayPeriod.endDate).format('MM/DD/YYYY')}
									</Select.Option>
								);
							})}
						</Select>
						<div
							className={`${styles[`search-filter-main-next`]} ${
								payPeriods &&
								(payPeriods.length === 0 || payPeriods.length === 1)
									? 'pointer-event-none'
									: ''
							}
								${payPeriodIndex == payPeriods.length - 1 && 'pointer-event-none'}
							`}
							onClick={nextPayPeriodHandler}
						>
							Next
							<Next />
						</div>
					</div>
					{isAddPayPeriodPermission && (
						<>
							<div className={styles['search-filter-main-date']}>
								<RangePicker
									className="range-picker"
									size="large"
									style={{ width: 260 }}
									format="MM/DD/YYYY"
									value={payPeriodDateRange}
									onChange={(data: any) => {
										dateRangeDateHandler(data);
									}}
								/>
							</div>
							<button
								className={`${styles['buttons--save']} ${
									payPeriodDateRange?.length != 2 ? 'pointer-event-none' : ''
								} ${isPayPeriodLoading && 'pointer-event-none'}`}
								disabled={payPeriodDateRange?.length != 2}
								onClick={() => handleSavePayPeriod()}
							>
								Save
							</button>
						</>
					)}
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
					{employeeCosts.length > 0 && payPeriodId && (
						<Space className={styles['search-filter']}>
							<ExportData
								params={{
									search: searchValue,
									payPeriodId: payPeriodId,
									payPeriodData: payPeriods.find(
										(payPeriod: any) => payPeriod.id === payPeriodId
									),
								}}
								moduleName="employeeCost"
							/>
						</Space>
					)}
				</div>
			</Col>
		</Row>
	);
};

export default SearchAndFilter;

interface ISearchAndFilter {
	searchValue: any;
	onChangeSearchValue: any;
	dateRangeDateHandler: any;
	payPeriodDateRange: any;
	onSavePayPeriod: any;
	onChangePayPeriodId: any;
	payPeriodId: any;
	onSyncEmployee: any;
	currentDatePayPeriodId: string;
}

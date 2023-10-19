import { SearchOutlined } from '@ant-design/icons';
// import type { DatePickerProps } from 'antd';
import { Col, Input, Row, Select, Space } from 'antd';
// import dayjs from 'dayjs';
// import moment from 'moment';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import styles from './index.module.scss';
import './index.scss';
import { SearchAndFilterProps } from './types';
import PayPeriodFilter from 'components/Global/PayPeriodFilter';

// For search filter and paginate
const SearchAndFilter: FC<SearchAndFilterProps> = (props) => {
	// Init
	const {
		searchValue,
		performFilterHandler,
		// dateRangeDateHandler,
		filterValue,
		onChangeSearchValue,
		onChangePayPeriod,
		// onChangeYear,
		// selectedYear,
		selectedPayPeriod,
	} = props;

	const { data: customer } = useSelector((state: any) => state.customer);
	const { data: classList } = useSelector((state: any) => state.class);
	const { data: employees } = useSelector((state: any) => state.employees);
	// const { optionData: payPeriods } = useSelector(
	// 	(state: any) => state.payPeriods
	// );
	// const { RangePicker } = DatePicker;

	// const rangePresets: TimeRangePickerProps['presets'] = [
	// 	{ label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
	// 	{ label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
	// 	{ label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
	// 	{ label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
	// ];
	// const presets = [
	// 	{
	// 		label: <span aria-label="Current Time to End of Day">Now ~ EOD</span>,
	// 		value: [dayjs(), dayjs().endOf('day')],
	// 	},
	// 	...rangePresets,
	// ];

	// useEffect(() => {
	// 	const data = payPeriods.filter((singlePeriod: any) => {
	// 		const startDate = new Date(singlePeriod.startDate).getFullYear();
	// 		const endDate = new Date(singlePeriod.endDate).getFullYear();

	// 		if (
	// 			startDate == new Date().getFullYear() ||
	// 			endDate == new Date().getFullYear()
	// 		) {
	// 			return singlePeriod;
	// 		}
	// 	});
	// 	setPayPeriodOptions(data);
	// }, [payPeriods]);

	// const onYearChange: DatePickerProps['onChange'] = (date, dateString: any) => {
	// 	onChangeYear(dateString);
	// 	onChangePayPeriod('');
	// 	// performFilterHandler('payPeriodId', null);
	// 	if (dateString !== '') {
	// 		const data = payPeriods.filter((singlePeriod: any) => {
	// 			const startDate = new Date(singlePeriod.startDate).getFullYear();
	// 			const endDate = new Date(singlePeriod.endDate).getFullYear();

	// 			if (String(startDate) == dateString || String(endDate) == dateString) {
	// 				return singlePeriod;
	// 			}
	// 		});

	// 		performFilterHandler('year', dateString, true);

	// 		setPayPeriodOptions(data);
	// 	} else {
	// 		performFilterHandler('year', null, true);
	// 		setPayPeriodOptions(payPeriods);
	// 	}
	// };

	const handleChangeSearchValue = (value: any) => {
		onChangeSearchValue && onChangeSearchValue(value);
	};

	// JSX
	return (
		<div className={styles['search-filter']}>
			<div className={styles['search-filter__wrapper']}>
				<Row>
					<Col>
						<Space>
							<Input
								className={styles['search-filter__search']}
								placeholder="Search here..."
								suffix={<SearchOutlined />}
								onChange={(e) => {
									handleChangeSearchValue(e.target.value);
								}}
								value={searchValue}
								size="large"
							/>
							<Select
								className={styles['search-filter__filter']}
								style={{ width: 200 }}
								onChange={(value) => performFilterHandler('employeeId', value)}
								size="large"
								placeholder="Employee"
								value={filterValue?.employeeId}
								showSearch
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								<Select.Option value="">Select Employee</Select.Option>
								{employees?.map((employee: any, index: number) => {
									return (
										<Select.Option value={employee?.id} key={index}>
											{employee?.fullName}
										</Select.Option>
									);
								})}
							</Select>
							<Select
								className={styles['search-filter__filter']}
								style={{ width: 200 }}
								onChange={(value) => performFilterHandler('customerId', value)}
								size="large"
								placeholder="Customer"
								value={filterValue?.customerId}
								showSearch
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								<Select.Option value="">Select Customer</Select.Option>
								{customer?.map((singleCustomer: any, index: number) => {
									return (
										<Select.Option value={singleCustomer?.Id} key={index}>
											{singleCustomer?.DisplayName}
										</Select.Option>
									);
								})}
							</Select>
							<Select
								className={styles['search-filter__filter']}
								style={{ width: 200 }}
								onChange={(value) => performFilterHandler('classId', value)}
								size="large"
								placeholder="Class"
								value={filterValue?.classId}
								showSearch
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								<Select.Option value="">Select Class</Select.Option>
								{classList?.map((singleClass: any, index: number) => {
									return (
										<Select.Option value={singleClass?.Id} key={index}>
											{singleClass?.FullyQualifiedName}
										</Select.Option>
									);
								})}
							</Select>
							{/* <DatePicker
								onChange={onYearChange}
								picker="year"
								size="large"
								className={styles['search-filter__search']}
								value={selectedYear ? dayjs(`${selectedYear}`, 'YYYY') : null}
							/> */}
							<PayPeriodFilter
								payPeriodId={selectedPayPeriod}
								onChangePayPeriodId={(value) => {
									onChangePayPeriod(value);
									if (value !== '') {
										performFilterHandler('payPeriodId', value);
									}
									// else {
									// 	performFilterHandler('year', selectedYear, true);
									// }
								}}
							/>
							{/* <Select
								className={styles['pay-period-filter']}
								onChange={(value) => {
									onChangePayPeriod(value);
									if (value !== '') {
										performFilterHandler('payPeriodId', value);
									} else {
										performFilterHandler('year', selectedYear, true);
									}
								}}
								size="large"
								placeholder="Pay Periods"
								value={selectedPayPeriod}
								// value={filterValue?.payPeriodId}
								showSearch
								// disabled={selectedYear ? false : true}
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
								<Select.Option value="">All</Select.Option>
								{payPeriodOptions?.map(
									(singlePayPeriod: any, index: number) => {
										return (
											<Select.Option value={singlePayPeriod?.id} key={index}>
												{moment(singlePayPeriod.startDate).format('MM/DD/YYYY')}{' '}
												- {moment(singlePayPeriod.endDate).format('MM/DD/YYYY')}
											</Select.Option>
										);
									}
								)}
							</Select> */}
							{/* <RangePicker
								className="range-picker"
								presets={rangePresets}
								size="large"
								style={{ width: 260 }}
								format="MM/DD/YYYY"
								onChange={(data: any) => {
									dateRangeDateHandler(
										data?.[0]?.$d ? data?.[0]?.$d : null,
										data?.[1]?.$d ? data?.[1]?.$d : null
									);
								}}
							/> */}
						</Space>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default SearchAndFilter;

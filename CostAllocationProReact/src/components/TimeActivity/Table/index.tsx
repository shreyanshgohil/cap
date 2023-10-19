/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { DatePicker, Input, Select, Space, Table } from 'antd';
import { SyncNow } from 'components/Global';
import ExportData from 'components/Global/ExportData';
import dayjs from 'dayjs';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTimeLogs } from 'redux/action/timeLogsAction';
import { postApi } from 'redux/apis';
import { timeActivitySyncDate } from 'redux/slice/companySlice';
import { AppDispatch } from 'redux/store';
import {
	AddInRoundSvg,
	DeleteActionSvg,
	EditActionSvg,
	HoursSvg,
	SortSvgBottom,
	SortSvgTop,
	SplitSvg,
	SubInRoundSvg,
	TickSmall,
} from 'utils/svgs';
import { checkPermission, checkTimeFormat, toastText } from 'utils/utils';
import SearchAndFilter from '../SearchAndFilter/index';
import './index.scss';
import { DynamicTableProps } from './types';

const DynamicTable: FC<DynamicTableProps> = (props) => {
	// Inits

	const {
		userDataSource,
		performSearchHandler,
		performFilterHandler,
		searchValue,
		onChangeSearchValue,
		filterValue,
		showModal,
		setEditSelectedTimeLog,
		tableRef,
		performSortHandler,
		dateRangeDateHandler,
		sortHandler,
		updateTimeLogHandler,
		saveAddedItemHandler,
		updateSavedTimeLog,
		disableHandler,
		dateRangeDate,
		splitTimeLogHandler,
		cancelSplitHandler,
		saveSplitTimeLogHandler,
		updateSplitActivityHandler,
		updateSplitActivityOnBlur,
		subSplitHandler,
		removeSubSplitHandler,
		onResetFilter,
		openTables,
		setOpenTables,
		onChangeYear,
		selectedYear,
		onChangePayPeriod,
	} = props;

	const { Column } = Table;
	const [lastSyncTime, setLastSyncTime] = useState(new Date());

	const { data: customer } = useSelector((state: any) => state.customer);
	const { data: classList } = useSelector((state: any) => state.class);
	const { data: employees } = useSelector((state: any) => state.employees);
	const timeLogs = useSelector((state: any) => state.timeLogs.data);

	const { isLoading } = useSelector((state: any) => state.timeLogs);
	const dateFormat = 'MM/DD/YYYY';

	const { optionData: payPeriods } = useSelector(
		(state: any) => state.payPeriods
	);

	const dispatch = useDispatch<AppDispatch>();

	// const [selectedYear, setSelectedYear] = useState<string | null>(null);
	const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);
	const [payPeriodData, setPayPeriodData] = useState({});

	const [syncLoading, setSyncLoading] = useState(false);
	const selectedCompanyId = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.companyId
	);

	const timeActivityLastSyncDate = useSelector(
		(state: any) =>
			state?.companies?.selectedCompanyDetails?.company
				?.timeActivitiesLastSyncDate
	);

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isAddTimeLogPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Time Logs',
		permission: ['add'],
	});

	const isEditTimeLogPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Time Logs',
		permission: ['edit'],
	});

	const isDeleteTimeLogPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Time Logs',
		permission: ['delete'],
	});

	useEffect(() => {
		setLastSyncTime(timeActivityLastSyncDate);
	}, [timeActivityLastSyncDate]);

	const editDataHandler = (userObject: any) => {
		setEditSelectedTimeLog(userObject);
	};

	const deleteDataHandler = (userObject: any) => {
		setEditSelectedTimeLog(userObject);
	};

	// For handle the table change click
	const tableChangeHandler = (_: any, __: any, data: any) => {
		let sort = null;
		if (sortHandler[data.columnKey] === 'asc') {
			sort = 'descend';
		} else {
			sort = 'ascend';
		}
		if (performSortHandler) {
			performSortHandler(data.columnKey, sort);
		}
	};

	const syncTimeActivities = () => {
		setSyncLoading(true);
		postApi('/time-activities/sync', {
			companyId: selectedCompanyId,
		})
			.then(() => {
				setSyncLoading(false);
				dispatch(getTimeLogs({}));
				dispatch(timeActivitySyncDate());
				toastText('Time activities synced successfully', 'success');
			})
			.catch((err) => {
				setSyncLoading(false);
				toastText(err?.response?.data?.message, 'error');
			});
	};

	const syncNowHandler = () => {
		// dispatch(refreshClass());
		// dispatch(refreshOfAccountAction());
		// dispatch(refreshAccountAction());
		syncTimeActivities();
		setLastSyncTime(new Date());
		setSelectedPayPeriod(null);
		onChangePayPeriod && onChangePayPeriod(null);
		onChangeYear(new Date().getFullYear());
		// setSelectedYear(null);
		onResetFilter({});
	};

	const padTo2Digits = (num: any) => {
		return num.toString().padStart(2, '0');
	};

	const formatDate = (date: any) => {
		return [
			padTo2Digits(date.getMonth() + 1),
			padTo2Digits(date.getDate()),
			date.getFullYear(),
		].join('/');
	};

	const openTableHandler = (timeLog: any) => {
		if (!openTables.includes(timeLog.id)) {
			setOpenTables([...openTables, timeLog.id]);
		} else {
			setOpenTables((prevState: any) => {
				return prevState.filter(
					(singleTimeLogId: string) => singleTimeLogId !== timeLog.id
				);
			});
		}
	};

	// Gets clicked on
	const cancelSplitButtonClickHandler = (timeLog: any) => {
		setOpenTables((prevState: any) => {
			return prevState.filter(
				(singleTimeLogId: string) => singleTimeLogId !== timeLog.id
			);
		});
		cancelSplitHandler(timeLog);
	};

	// Gets clicked on
	const saveSplitButtonClickHandler = (timeLog: any) => {
		saveSplitTimeLogHandler(timeLog);
	};

	const subSplitClicKHandler = (
		splitTimeActivity: any,
		timeActivity: any,
		index: number
	) => {
		subSplitHandler(splitTimeActivity, timeActivity, index);
	};

	const removeSubSplitClickHandler = (
		splitTimeActivity: any,
		timeLog: any,
		index: number
	) => {
		removeSubSplitHandler(splitTimeActivity, timeLog, index);
	};
	// DO NOT DELETE NEED FOR SPRINt 4 for sub table
	const expandedRowRender = (timeActivity: any) => {
		const data = timeActivity.isSplitting
			? {
					footer: () => {
						return (
							<div className="split-table-button__wrapper">
								<button
									className="split-table-button split-table-button-save"
									onClick={() => saveSplitButtonClickHandler(timeActivity)}
								>
									Save
								</button>
								<button
									className="split-table-button split-table-button-cancel"
									onClick={() => cancelSplitButtonClickHandler(timeActivity)}
								>
									Cancel
								</button>
							</div>
						);
					},
			  }
			: {};

		return (
			<Table
				dataSource={timeActivity.SplitTimeActivities}
				pagination={false}
				showHeader={false}
				className="split-table"
				scroll={{ y: '30vh' }}
				{...data}
			>
				<Column
					title="Activity Date"
					dataIndex="activityDate"
					key="activityDate"
					width={'180px'}
					className="bg-split"
					render={(activityDate, timeLog: any) => {
						const todayDate = new Date();

						const activityDateCopy: Date = new Date(activityDate);
						const response = formatDate(activityDateCopy);
						return timeLog.isAdding ? (
							<DatePicker
								size="large"
								status={timeLog.errorActivityDate && 'error'}
								showToday={false}
								defaultValue={dayjs(
									`${todayDate.getFullYear}/${
										todayDate.getMonth() + 1
									}/${todayDate.getDate()}`
								)}
								format={dateFormat}
								value={activityDate ? dayjs(activityDate) : null}
								onChange={(_, date: string) => {
									updateTimeLogHandler(timeLog.id, 'activityDate', date);
								}}
							/>
						) : (
							<p>{response}</p>
						);
					}}
				/>
				<Column
					title="Employee"
					dataIndex="employeeName"
					key="employee"
					className="bg-split"
					width={'250px'}
					render={() => {
						return <p>{timeActivity.employeeName}</p>;
					}}
				/>
				<Column
					title="Customer"
					dataIndex="customerName"
					key="customer"
					className="bg-split"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					sortOrder={sortHandler.customer === 'asc' ? 'ascend' : 'descend'} // Add this line
					sorter={() => {
						return null as any;
					}}
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={() => {
						return sortHandler.customer === 'asc' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					width={'250px'}
					render={(_, timeLog: any, index: number) => {
						return timeActivity.isSplitting ? (
							<Select
								style={{ width: 200 }}
								size="large"
								status={timeLog.errorCustomer && 'error'}
								placeholder="Customer"
								onChange={(_, data: any) => {
									updateSplitActivityHandler(
										timeActivity.id,
										'customerName',
										data,
										index
									);
								}}
								value={timeLog.customerId}
								showSearch={true}
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								{customer?.map((singleCustomer: any, index: number) => {
									return (
										<Select.Option value={singleCustomer?.Id} key={index}>
											{singleCustomer?.DisplayName}
										</Select.Option>
									);
								})}
							</Select>
						) : (
							<p>{timeLog.customerName}</p>
						);
					}}
				/>
				<Column
					title="Class"
					dataIndex="className"
					key="class"
					className="bg-split"
					width={'260px'}
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					sortOrder={sortHandler.class === 'asc' ? 'ascend' : 'descend'} // Add this line
					sorter={() => {
						return null as any;
					}}
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={() => {
						return sortHandler.class === 'asc' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					render={(_, timeLog: any, index: any) => {
						return timeActivity.isSplitting ? (
							<Select
								style={{ width: 200 }}
								size="large"
								placeholder="Class"
								status={timeLog.errorClass && 'error'}
								onChange={(_, data: any) => {
									updateSplitActivityHandler(
										timeActivity.id,
										'className',
										data,
										index
									);
								}}
								value={timeLog.classId}
								showSearch={true}
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								{classList?.map((singleClass: any, index: number) => {
									return (
										<Select.Option value={singleClass?.Id} key={index}>
											{singleClass?.FullyQualifiedName}
										</Select.Option>
									);
								})}
							</Select>
						) : (
							<p>{timeLog.className}</p>
						);
					}}
				/>
				<Column
					title={
						<div className="hrs-wrapper">
							<HoursSvg />
							<p>Hrs</p>
						</div>
					}
					dataIndex="actualTimeLog"
					key="status"
					className="bg-split"
					width={'10%'}
					render={(_, timeLog: any, index: number) => {
						return (
							<Input
								className={timeLog.errorHrs ? 'border-error' : 'border-normal'}
								size="large"
								defaultValue={`${timeLog.hours}:${timeLog.minute}`}
								value={timeLog.actualTimeLog}
								disabled={!timeLog.isAdding && !isEditTimeLogPermission}
								onChange={(event) => {
									if (!checkTimeFormat(event.target.value)) {
										return;
									}
									if (timeLog.isAdding) {
										updateSplitActivityHandler(
											timeActivity.id,
											'hrs',
											event.target.value,
											index
										);
									} else {
										updateSplitActivityHandler(
											timeActivity.id,
											'hrs',
											event.target.value,
											index
										);
										// updateSavedTimeLog(timeLog.id, event.target.value);
									}
								}}
								onBlur={(event) => {
									updateSplitActivityOnBlur(
										timeActivity.id,
										'hrs',
										event.target.value,
										index
									);
								}}
							/>
						);
					}}
				/>

				<Column
					title="Actions"
					dataIndex="action"
					key="action"
					className="bg-split"
					width={'15%'}
					render={(values, data: any, index) => {
						return (
							<Space size={10}>
								{!(data.isCompanyAdmin || data.isAdmin) ? (
									<>
										{isEditTimeLogPermission && (
											<>
												<div
													className="cursor-pointer flex align-center justify-center action-svg"
													onClick={() =>
														subSplitClicKHandler(data, timeActivity, index)
													}
												>
													<AddInRoundSvg />
												</div>

												<div
													className="cursor-pointer flex align-center justify-center action-svg"
													onClick={() =>
														removeSubSplitClickHandler(
															data,
															timeActivity,
															index
														)
													}
												>
													<SubInRoundSvg />
												</div>
											</>
										)}
										{/* {timeActivity.SplitTimeActivities?.length > 2 && (
										)} */}
									</>
								) : null}
							</Space>
						);
					}}
				/>
			</Table>
		);
	};

	// Clicking on the split button
	const splitClickHandler = (data: any) => {
		editDataHandler(data);
		splitTimeLogHandler(data);
		setOpenTables([...openTables, data.id]);
	};

	// Edit Time Activity
	const editActivityHandler = (data: any) => {
		// updateTimeLog;

		updateSavedTimeLog(
			data.id,
			data.actualTimeLog,
			data.classId,
			data.className,
			data.customerId,
			data.customerName
		);
	};

	// ICON Selection
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const CustomExpandIcon = ({ expanded, onExpand, record }: any) => {
		if (record.SplitTimeActivities.length === 0) {
			return <></>;
		}

		return (
			<div onClick={() => openTableHandler(record)}>
				{expanded ? (
					<svg
						className="cursor-pointer"
						xmlns="http://www.w3.org/2000/svg"
						width="25"
						height="25"
						viewBox="0 0 25 25"
						fill="none"
					>
						<path
							d="M12.5 8.46875L7.09375 13.875L8.4375 15.1875L12.5 11.125L16.5625 15.1875L17.9063 13.875L12.5 8.46875ZM12.5 1.49012e-06C14.2083 1.49012e-06 15.8229 0.328126 17.3438 0.984376C18.8646 1.64063 20.1927 2.53646 21.3281 3.67188C22.4635 4.80729 23.3594 6.13542 24.0156 7.65625C24.6719 9.17708 25 10.7917 25 12.5C25 14.2292 24.6719 15.8542 24.0156 17.375C23.3594 18.8958 22.4635 20.2188 21.3281 21.3438C20.1927 22.4688 18.8646 23.3594 17.3438 24.0156C15.8229 24.6719 14.2083 25 12.5 25C10.7708 25 9.14583 24.6719 7.625 24.0156C6.10417 23.3594 4.78125 22.4688 3.65625 21.3438C2.53125 20.2188 1.64063 18.8958 0.984376 17.375C0.328126 15.8542 1.49012e-06 14.2292 1.49012e-06 12.5C1.49012e-06 10.7917 0.328126 9.17708 0.984376 7.65625C1.64063 6.13542 2.53125 4.80729 3.65625 3.67188C4.78125 2.53646 6.10417 1.64063 7.625 0.984376C9.14583 0.328126 10.7708 1.49012e-06 12.5 1.49012e-06ZM12.5 1.875C9.54167 1.875 7.03125 2.91146 4.96875 4.98438C2.90625 7.05729 1.875 9.5625 1.875 12.5C1.875 15.4583 2.90625 17.9688 4.96875 20.0313C7.03125 22.0938 9.54167 23.125 12.5 23.125C15.4375 23.125 17.9427 22.0938 20.0156 20.0313C22.0885 17.9688 23.125 15.4583 23.125 12.5C23.125 9.5625 22.0885 7.05729 20.0156 4.98438C17.9427 2.91146 15.4375 1.875 12.5 1.875Z"
							fill="#B3B3B3"
						/>
					</svg>
				) : (
					<svg
						className="cursor-pointer"
						xmlns="http://www.w3.org/2000/svg"
						width={26}
						height={26}
						fill="none"
					>
						<path
							fill="#B3B3B3"
							d="m13 17.031 5.406-5.406-1.343-1.313L13 14.375l-4.063-4.063-1.343 1.313L13 17.031Zm0 8.469c-1.708 0-3.323-.328-4.844-.984a12.678 12.678 0 0 1-3.984-2.688 12.678 12.678 0 0 1-2.688-3.984A12.095 12.095 0 0 1 .5 13c0-1.73.328-3.354.984-4.875a12.492 12.492 0 0 1 2.688-3.969 12.814 12.814 0 0 1 3.984-2.672A12.095 12.095 0 0 1 13 .5c1.73 0 3.354.328 4.875.984a12.623 12.623 0 0 1 3.969 2.672 12.622 12.622 0 0 1 2.672 3.969c.656 1.52.984 3.146.984 4.875 0 1.708-.328 3.323-.984 4.844a12.812 12.812 0 0 1-2.672 3.984 12.492 12.492 0 0 1-3.969 2.688c-1.52.656-3.146.984-4.875.984Zm0-1.875c2.958 0 5.469-1.037 7.531-3.11 2.063-2.072 3.094-4.578 3.094-7.515 0-2.958-1.031-5.469-3.094-7.531C18.47 3.406 15.958 2.375 13 2.375c-2.938 0-5.443 1.031-7.516 3.094C3.411 7.53 2.375 10.042 2.375 13c0 2.938 1.036 5.443 3.11 7.516 2.072 2.073 4.577 3.109 7.515 3.109Z"
						/>
					</svg>
				)}
			</div>
		);
	};

	const deleteTimeLogHandler = (data: any) => {
		deleteDataHandler(data);
		showModal();
	};

	// JSX

	const handleChangeSearchValue = (value: any) => {
		onChangeSearchValue && onChangeSearchValue(value);
	};

	return (
		<div className={'dynamic-table'}>
			<div className="dynamic-table__filter-sync">
				<div className="dynamic-table__filter-sync--filter">
					<SearchAndFilter
						performSearchHandler={performSearchHandler}
						searchValue={searchValue}
						onChangeSearchValue={(value: any) => handleChangeSearchValue(value)}
						performFilterHandler={performFilterHandler}
						filterValue={filterValue}
						dateRangeDateHandler={dateRangeDateHandler}
						selectedYear={selectedYear}
						selectedPayPeriod={selectedPayPeriod}
						onChangePayPeriod={(value: string | null) => {
							setSelectedPayPeriod(value);
							const data = payPeriods.find(
								(singlePayPeriod: any) => singlePayPeriod.id === value
							);
							setPayPeriodData(data);
							onChangePayPeriod && onChangePayPeriod(data);
						}}
						onChangeYear={(value: string | null) => onChangeYear(value)}
						payPeriodData={payPeriodData}
					/>
				</div>

				<div className="dynamic-table__filter-sync--sync">
					{(isAddTimeLogPermission || isEditTimeLogPermission) && (
						<>
							<SyncNow
								isLastSyncNeeded={true}
								syncDate={lastSyncTime}
								handleSync={() => syncNowHandler()}
								tooltip=""
								key={1}
								isLoading={syncLoading}
							/>
							{timeLogs.length > 0 && <div className="pipe" />}
						</>
					)}
					{timeLogs.length > 0 && (
						<ExportData
							params={{
								search: searchValue,
								filter: filterValue,
								dateRangeDate: dateRangeDate,
								payPeriodId: selectedPayPeriod,
								payPeriodData: payPeriodData,
							}}
							moduleName="timeActivity"
						/>
					)}
				</div>
			</div>
			<Table
				expandable={{
					expandIcon: CustomExpandIcon,
					expandedRowRender,
					expandedRowKeys: openTables,
				}}
				dataSource={userDataSource}
				scroll={{ y: 'calc(80vh - 220px)' }}
				pagination={false}
				rowKey={(record: any) => {
					return record.id;
				}}
				className="table-global"
				ref={tableRef}
				onChange={tableChangeHandler}
			>
				<Column
					title="Activity Date"
					dataIndex="activityDate"
					key="activityDate"
					className="bg-white"
					width={'180px'}
					render={(activityDate, timeLog: any) => {
						const todayDate = new Date();

						const activityDateCopy: Date = new Date(activityDate);
						const response = formatDate(activityDateCopy);
						return timeLog.isAdding ? (
							<DatePicker
								size="large"
								status={timeLog.errorActivityDate && 'error'}
								showToday={false}
								defaultValue={dayjs(
									`${todayDate.getFullYear}/${
										todayDate.getMonth() + 1
									}/${todayDate.getDate()}`
								)}
								format={dateFormat}
								value={activityDate ? dayjs(activityDate) : null}
								onChange={(dataObj: any) => {
									updateTimeLogHandler(timeLog.id, 'activityDate', dataObj?.$d || '');
								}}
							/>
						) : (
							<p>{response}</p>
						);
					}}
				/>
				<Column
					title="Employee"
					dataIndex="employeeName"
					key="employee"
					className="bg-white"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					sortOrder={sortHandler.employee === 'asc' ? 'ascend' : 'descend'} // Add this line
					sorter={() => {
						return null as any;
					}}
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={() => {
						return sortHandler.employee === 'asc' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					width={'250px'}
					render={(_, timeLog: any) => {
						return timeLog.isAdding ? (
							<Select
								style={{ width: 200 }}
								size="large"
								placeholder="Employee"
								className={
									timeLog.errorEmployee ? 'border-error' : 'border-normal'
								}
								onChange={(_, data: any) => {
									updateTimeLogHandler(timeLog.id, 'employeeName', data);
								}}
								showSearch={true}
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								{employees?.map((employee: any, index: number) => {
									return (
										<Select.Option value={employee?.id} key={index}>
											{employee?.fullName}
										</Select.Option>
									);
								})}
							</Select>
						) : (
							<div
							// className={
							// 	timeLog?.isOver
							// 		? 'employee-over-hours'
							// 		: 'employee-normal-hours'
							// }
							>
								<p>{timeLog.employeeName}</p>
								{/* {timeLog?.isOver && (
									<p>
										Over Hours:{' '}
										{timeLog?.overHours?.toString()?.padStart(2, '0') || '00'}:
										{timeLog?.overMinutes?.toString()?.padStart(2, '0') || '00'}
									</p>
								)} */}
							</div>
						);
					}}
				/>
				<Column
					title="Customer"
					dataIndex="customerName"
					key="customer"
					className="bg-white"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					sortOrder={sortHandler.customer === 'asc' ? 'ascend' : 'descend'} // Add this line
					sorter={() => {
						return null as any;
					}}
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={() => {
						return sortHandler.customer === 'asc' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					width={'250px'}
					render={(_, timeLog: any) => {
						return timeLog.isAdding || timeLog.isCustomerNull ? (
							<Select
								style={{ width: 200 }}
								size="large"
								placeholder="Customer"
								// status={timeLog.errorEmployee && 'error'}
								className={
									timeLog.errorCustomer ? 'border-error' : 'border-normal'
								}
								disabled={timeLog.isDisabled}
								onChange={(_, data: any) => {
									updateTimeLogHandler(timeLog.id, 'customerName', data);
								}}
								showSearch={true}
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								{customer?.map((singleCustomer: any, index: number) => {
									return (
										<Select.Option value={singleCustomer?.Id} key={index}>
											{singleCustomer?.DisplayName}
										</Select.Option>
									);
								})}
							</Select>
						) : (
							<p>{timeLog.customerName}</p>
						);
					}}
				/>
				<Column
					title="Class"
					dataIndex="className"
					key="class"
					className="bg-white"
					width={'260px'}
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					sortOrder={sortHandler.class === 'asc' ? 'ascend' : 'descend'} // Add this line
					sorter={() => {
						return null as any;
					}}
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={() => {
						return sortHandler.class === 'asc' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					render={(_, timeLog: any) => {
						return timeLog.isAdding || timeLog.isClassNull ? (
							<Select
								style={{ width: 200 }}
								size="large"
								placeholder="Class"
								className={
									timeLog.errorClass ? 'border-error' : 'border-normal'
								}
								disabled={timeLog.isDisabled}
								onChange={(_, data: any) => {
									updateTimeLogHandler(timeLog.id, 'className', data);
								}}
								showSearch={true}
								filterOption={(input, option: any) =>
									(option?.children as string)
										.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								{classList?.map((singleClass: any, index: number) => {
									return (
										<Select.Option value={singleClass?.Id} key={index}>
											{singleClass?.FullyQualifiedName}
										</Select.Option>
									);
								})}
							</Select>
						) : (
							timeLog.className
						);
					}}
				/>
				<Column
					title={
						<div className="hrs-wrapper">
							<HoursSvg />
							<p>Hrs</p>
						</div>
					}
					dataIndex="actualTimeLog"
					key="status"
					className="bg-white"
					width={'10%'}
					render={(_, timeLog: any) => {
						return (
							<Input
								size="large"
								defaultValue={`${timeLog.hours}:${timeLog.minute}`}
								value={timeLog.hours ? `${timeLog.actualTimeLog}` : '00:00'}
								disabled={
									(!timeLog.isAdding && !isEditTimeLogPermission) ||
									timeLog.isSplitting ||
									timeLog.SplitTimeActivities.length > 0 ||
									(!timeLog.isClassSelected && timeLog.isClassNull) ||
									(!timeLog.isCustomerSelected && timeLog.isCustomerNull)
								}
								onChange={(event) => {
									if (!checkTimeFormat(event.target.value)) {
										return;
									}
									if (timeLog.isAdding) {
										updateTimeLogHandler(timeLog.id, 'hrs', event.target.value);
									} else if (timeLog.isClassNull) {
										updateTimeLogHandler(timeLog.id, 'hrs', event.target.value);
									} else if (timeLog.isCustomerNull) {
										updateTimeLogHandler(timeLog.id, 'hrs', event.target.value);
									} else {
										updateTimeLogHandler(timeLog.id, 'hrs', event.target.value);
									}
								}}
								onBlur={async (event) => {
									updateSavedTimeLog(
										timeLog.id,
										event.target.value,
										timeLog.classId,
										timeLog.className,
										timeLog.customerId,
										timeLog.customerName
									);
								}}
							/>
						);
					}}
					// width={'176px'}
				/>

				<Column
					title="Actions"
					dataIndex="action"
					key="action"
					className="bg-white"
					width={'15%'}
					render={(values, data: any) => {
						return (
							<Space size={20}>
								<>
									{data.isAdding && (
										<div
											className={`cursor-pointer flex align-center justify-center action-svg ${
												isLoading && 'pointer-event-none'
											}`}
											onClick={() => saveAddedItemHandler(data.id)}
										>
											<TickSmall />
											<p className="split-text">Add</p>
										</div>
									)}
									{isEditTimeLogPermission && !data.isAdding ? (
										data.isClassNull || data.isCustomerNull ? (
											data.isEditing ? (
												<div
													className={`cursor-pointer flex align-center justify-center action-svg ${
														data.SplitTimeActivities.length > 0 ? '' : ' '
													} ${!data.classId || !data.customerId ? '' : ' '}
														`}
													onClick={() => editActivityHandler(data)}
												>
													<TickSmall />
													<p className="split-text">Edit</p>
												</div>
											) : (
												<div
													className={`cursor-pointer flex align-center justify-center action-svg ${
														data.SplitTimeActivities.length > 0
															? 'pointer-event-none'
															: ' '
													}
														`}
													onClick={() => disableHandler(data.id)}
												>
													<EditActionSvg />
													<p className="split-text">Edit</p>
												</div>
											)
										) : null
									) : null}
									{/* {!data.isAdding &&
										(data.isClassNull || data.isCustomerNull) && (
											<div
												className={`cursor-pointer flex align-center justify-center action-svg ${data.SplitTimeActivities.length > 0 ?
													'pointer-event-none' : ' '
													} ${(!data.classId || !data.customerId) ? 'pointer-event-none' : ' '
													}
											`}
												// ${
												// 	!data.isDisabled &&
												// 	(!data.isCustomerSelected && !data.isClassSelected) &&
												// 	'pointer-event-none'
												// }
												//  ${
												// 	data.isCustomerNull &&
												// 	!data.isCustomerSelected &&
												// 	'pointer-event-none'
												// }
												onClick={() => {
													if (data.isDisabled) {
														disableHandler(data.id);
													} else {
														editActivityHandler(data);
													}
												}}
											>
												{!data.isDisabled ? <TickSmall /> : <EditActionSvg />}
												<p className="split-text">Edit</p>
											</div>
										)} */}

									{isEditTimeLogPermission &&
										!data.isAdding &&
										!data.isClassNull &&
										!data.isCustomerNull && (
											<div
												className={`cursor-pointer flex align-center justify-center action-svg ${
													data.SplitTimeActivities.length > 0 &&
													'pointer-event-none'
												}`}
												onClick={() => splitClickHandler(data)}
											>
												<SplitSvg />
												<p className="split-text">split</p>
											</div>
										)}
									{isDeleteTimeLogPermission && (
										<div
											className="cursor-pointer flex align-center justify-center action-svg"
											onClick={() => deleteTimeLogHandler(data)}
										>
											<DeleteActionSvg />
											<p className="delete-text">Delete</p>
										</div>
									)}
								</>
							</Space>
						);
					}}
				/>
			</Table>
		</div>
	);
};

export default DynamicTable;

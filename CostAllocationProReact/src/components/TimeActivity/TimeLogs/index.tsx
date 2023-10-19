import ConfirmDelete from 'components/Global/confirmDeleteModel';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chartOfAccountAction } from 'redux/action/chartOfAccountAction';
import { classAction } from 'redux/action/classAction';
import { customerAccountAction } from 'redux/action/customerAction';
import { getEmployeeAction } from 'redux/action/employeeAction';
import { payPeriodOptionsAction } from 'redux/action/payPeriodAction';
import {
	deleteTimeLogAction,
	getTimeLogs,
	getTimeLogsPaginate,
} from 'redux/action/timeLogsAction';
import { AppDispatch } from 'redux/store';
import { useDebounce } from 'use-debounce';
import DynamicTable from '../Table';
import styles from './index.module.scss';
import { TimeLogsProps } from './types';
import dayjs from 'dayjs';

// For time log section
const TimeLogs: FC<TimeLogsProps> = (props) => {
	// Inits
	const {
		timeLogs,
		updateTimeLogHandler,
		disableHandler,
		saveAddedItemHandler,
		updateSavedTimeLog,
		deleteTimeLogHandler,
		splitTimeLogHandler,
		error,
		cancelSplitHandler,
		saveSplitTimeLogHandler,
		updateSplitActivityHandler,
		updateSplitActivityOnBlur,
		subSplitHandler,
		removeSubSplitHandler,
		// hoursUnder,
		openTables,
		setOpenTables,
		onChangePayPeriod
	} = props;

	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');
	const [filterValue, setFilterValue] = useState({});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editSelectedTimeLog, setEditSelectedTimeLog] = useState<any>();
	const [isInViewPort, setIsInViewPort] = useState<boolean>(false);
	const [sortHandler, setSortHandler] = useState({
		employeeId: 'asc',
		customerId: 'asc',
		classId: 'asc',
	});
	const [sortName, setSortName] = useState('');
	const [sortValue, setSortValue] = useState('');
	const [dateRangeDate, setDateRangeDate] = useState({});
	const tableRef = useRef<HTMLDivElement>(null);
	const { count, deleteLoader } = useSelector((state: any) => state.timeLogs);
	const dispatch = useDispatch<AppDispatch>();

	const [debounceSearchValue] = useDebounce(searchValue, 1000);
	const [applySearch, setApplySearch] = useState(false);
	const [selectedYear, setSelectedYear] = useState<any>(
		dayjs(new Date()).year()
	);

	const onChangeYear = (value: string | null) => {
		setSelectedYear(value);
	};

	// Perform Filter
	const performFilterHandler = (
		data: any,
		value: any,
		payPeriodNull?: boolean
	) => {
		setCurrentPage(1);
		setFilterValue((previousState: any) => {
			return {
				...previousState,
				[data]: value,
			};
		});

		if (payPeriodNull) {
			setFilterValue((previousState: any) => {
				return {
					...previousState,
					payPeriodId: null,
				};
			});
		}

		const query: any = {
			page: 1,
			limit: 10,
			search: searchValue,
			...filterValue,
			[data]: value,
			...dateRangeDate,
			// isOverHours: hoursUnder,
			// year: selectedYear,
		};

		if (payPeriodNull) {
			query['payPeriodId'] = null;
		}

		dispatch(getTimeLogs(query));
	};

	// For perform the search operation
	const performSearchHandler = (e: any) => {
		// const { value } = event.target;
		// setSearchValue(value.trimStart());

		if (e.trimStart().length >= 3) {
			setCurrentPage(1);
			const query = {
				page: 1,
				limit: 10,
				search: e.trimStart(),
				...filterValue,
				...dateRangeDate,
				// isOverHours: hoursUnder,
				// year: selectedYear,
			};
			dispatch(getTimeLogs(query));
		} else {
			if (e.trimStart().length !== 0 || e === '') {
				setCurrentPage(1);
				const query = {
					page: 1,
					limit: 10,
					search: '',
					...filterValue,
					...dateRangeDate,
					// isOverHours: hoursUnder,
					// year: selectedYear,
				};
				dispatch(getTimeLogs(query));
			}
		}
	};

	useEffect(() => {
		if (applySearch) {
			performSearchHandler(debounceSearchValue);
		}
	}, [debounceSearchValue]);

	// for pagination
	const paginationChangeHandler = (pageNo: number) => {
		setCurrentPage(pageNo);
	};

	//   For open the model
	const showModal = () => {
		setIsModalOpen(true);
	};

	// For the run initial call from use effect
	const initialFunction = () => {
		dispatch(classAction());
		dispatch(chartOfAccountAction());
		dispatch(customerAccountAction());
		dispatch(getEmployeeAction());
		dispatch(payPeriodOptionsAction());
	};

	//adding body to scroll to table body Infinite scroll
	const scrollHandler = useCallback((event: any) => {
		const { currentTarget } = event;
		const tableBody = currentTarget?.querySelector('tbody');
		if (
			tableBody?.getBoundingClientRect().top +
				tableBody.getBoundingClientRect().height <
			screen.height
		) {
			setIsInViewPort(true);
		} else {
			setIsInViewPort(false);
		}
	}, []);

	const dateRangeDateHandler = (startDate: any, endDate: any) => {
		setDateRangeDate({ startDate, endDate });
		setCurrentPage(1);
		const query = {
			page: 1,
			limit: 10,
			search: searchValue,
			...filterValue,
			startDate,
			endDate,
			// isOverHours: hoursUnder,
		};
		dispatch(getTimeLogs(query));
	};

	useEffect(() => {
		if (tableRef.current) {
			const tableBody = tableRef.current
				? tableRef.current?.querySelector('.ant-table-body')
				: null;
			// if (tableBody) {
			tableBody?.addEventListener('scroll', scrollHandler);
			return () => tableBody?.removeEventListener('scroll', scrollHandler);
			// }
		}
	}, [tableRef.current]);

	// For perform the sorting operation
	const performSortHandler = (name: string, value: string) => {
		setSortName(name);
		setSortValue(value);
		setSortHandler((prevState: any) => {
			return {
				...prevState,
				[name]: value === 'ascend' ? 'asc' : 'desc',
			};
		});

		const query: any = {
			page: 1,
			limit: 10,
			search: searchValue,
			type: value === 'ascend' ? 'asc' : 'desc',
			...filterValue,
			...dateRangeDate,
			// isOverHours: hoursUnder,
			// year: selectedYear,
		};
		if (name === 'customer') {
			query['sort'] = 'customerName';
		}
		if (name === 'employee') {
			query['sort'] = 'employee';
		}
		if (name === 'class') {
			query['sort'] = 'className';
		}

		dispatch(getTimeLogs(query));

		setCurrentPage(1);
	};

	useEffect(() => {
		if (isInViewPort && timeLogs.length < count) {
			setCurrentPage((prev) => prev + 1);
			const query: any = {
				page: currentPage + 1,
				limit: 10,
				search: searchValue,
				...filterValue,
				...dateRangeDate,
				type: sortValue === 'ascend' ? 'asc' : 'desc',
				// isOverHours: hoursUnder,
				// year: selectedYear,
			};

			if (sortName === 'customer') {
				query['sort'] = 'customerName';
			}
			if (sortName === 'employee') {
				query['sort'] = 'employee';
			}
			if (sortName === 'class') {
				query['sort'] = 'className';
			}
			dispatch(getTimeLogsPaginate(query));
		}
	}, [isInViewPort]);

	//   For cancel operation
	const handleCancel = () => {
		setIsModalOpen(false);
	};

	//   For conform operation
	const handleOk = () => {
		setIsModalOpen(false);
	};

	// For actual delete of the time log
	const deleteHandler = async () => {
		await dispatch(
			deleteTimeLogAction({ timeActivityId: editSelectedTimeLog.id })
		);
		setIsModalOpen(false);
		deleteTimeLogHandler(editSelectedTimeLog);
	};

	// const getTimeLogOnHoursChange = () => {
	// 	const query = {
	// 		page: 1,
	// 		limit: 10,
	// 		search: searchValue,
	// 		...filterValue,
	// 		...dateRangeDate,
	// 		isOverHours: hoursUnder,
	// 		year: selectedYear,
	// 	};
	// 	dispatch(getTimeLogs(query));
	// };

	useEffect(() => {
		initialFunction();
	}, []);

	// useEffect(() => {
	// 	if (hoursUnder) {
	// 		getTimeLogOnHoursChange();
	// 	}
	// }, [hoursUnder]);

	// JSX
	return (
		<div className={styles['time-logs']}>
			<div className={styles['time-logs__wrapper']}>
				<div>
					<DynamicTable
						openTables={openTables}
						setOpenTables={setOpenTables}
						userDataSource={timeLogs}
						paginationChangeHandler={paginationChangeHandler}
						currentPage={currentPage}
						totalRecords={10}
						performSearchHandler={performSearchHandler}
						searchValue={searchValue}
						onChangeSearchValue={(value: any) => {
							setSearchValue(value);
							setApplySearch(true);
						}}
						showModal={showModal}
						setEditSelectedTimeLog={setEditSelectedTimeLog}
						tableRef={tableRef}
						performSortHandler={performSortHandler}
						performFilterHandler={performFilterHandler}
						filterValue={filterValue}
						dateRangeDateHandler={dateRangeDateHandler}
						sortHandler={sortHandler}
						updateTimeLogHandler={updateTimeLogHandler}
						disableHandler={disableHandler}
						saveAddedItemHandler={saveAddedItemHandler}
						updateSavedTimeLog={updateSavedTimeLog}
						error={error}
						dateRangeDate={dateRangeDate}
						splitTimeLogHandler={splitTimeLogHandler}
						cancelSplitHandler={cancelSplitHandler}
						saveSplitTimeLogHandler={saveSplitTimeLogHandler}
						updateSplitActivityHandler={updateSplitActivityHandler}
						updateSplitActivityOnBlur={updateSplitActivityOnBlur}
						subSplitHandler={subSplitHandler}
						removeSubSplitHandler={removeSubSplitHandler}
						onResetFilter={(value) => {
							setFilterValue(value);
							setSearchValue('');
						}}
						onChangeYear={onChangeYear}
						selectedYear={selectedYear}
						onChangePayPeriod={(payPeriod: string | null) => {
							onChangePayPeriod && onChangePayPeriod(payPeriod);
						}}
					/>
				</div>
				<ConfirmDelete
					handleCancel={handleCancel}
					handleOk={handleOk}
					isModalOpen={isModalOpen}
					deleteHandler={deleteHandler}
					isLoading={deleteLoader}
				/>
			</div>
		</div>
	);
};

export default TimeLogs;

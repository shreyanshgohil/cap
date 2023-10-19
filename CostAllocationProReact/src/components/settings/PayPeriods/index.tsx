/* eslint-disable @typescript-eslint/no-unused-vars */
import { Loader } from 'components/Global';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	editPeriodAction,
	getPeriodDatesAction,
	paginateAction,
	payPeriodAction,
} from 'redux/action/payPeriodAction';
import { AppDispatch } from 'redux/store';
import { generateDateRange, isDateRangeDisabled, toastText } from 'utils/utils';
import DynamicTable from './Table';
import styles from './index.module.scss';
import { PayPeriodInterface } from './types';

const PayPeriod = (props: PayPeriodInterface) => {
	const dispatch = useDispatch<AppDispatch>();
	const { changeEmployeeCost } = props;
	const tableRef = useRef<HTMLDivElement>(null);
	const [formateData, setFormateData] = useState<any>([]);
	const [formateDataCopyObj, setFormateDataCopyObj] = useState<any>([]);
	const [drawerAnimation, setDrawerAnimation] = useState<boolean>(false);
	const [isSideDrawerOpen, setSideDrawerOpen] = useState<boolean>(false);
	const [isInViewPort, setIsInViewPort] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');
	const [filterValue, setFilterValue] = useState('');
	const [payPeriodYear, setPayPeriodYear] = useState(null);

	const [drawerInfo, setDrawerInfo] = useState({
		drawerTitle: 'Users',
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editSelectedUser, setEditSelectedUser] = useState<any>();
	const {
		data: payPeriods,
		payPeriodDates,
		count,
		isLoading,
	} = useSelector((state: any) => state.payPeriods);
	const [payPeriodDatesFiltered, setPayPeriodDatesFiltered] = useState([]);

	// Handle the pagination for the table
	const paginationChangeHandler = (pageNo: number) => {
		setCurrentPage(pageNo);
	};

	//   For open the model
	const showModal = () => {
		setIsModalOpen(true);
	};

	// For open the sideDrawer with animation
	const openDrawerHandler = () => {
		setDrawerInfo({ drawerTitle: 'Add Users' });
		setDrawerAnimation(true);
		setSideDrawerOpen(true);
	};

	// For change the data and title between components
	const setDrawerInfoHandler = (drawerTitle: any) => {
		setDrawerInfo({ drawerTitle });
	};

	// For perform the sorting operation
	const performSortHandler = () => {
		setCurrentPage(1);
	};

	// Perform Filter
	const performFilterHandler = (value: any) => {
		setPayPeriodYear(value);
		let query;
		setCurrentPage(1);
		if (value?.$d) {
			const year: any = new Date(value.$d).getFullYear();
			setFilterValue(year);
			query = {
				page: 1,
				limit: 10,
				year: year,
			};
		} else {
			setFilterValue('');
			query = {
				page: 1,
				limit: 10,
			};
		}
		dispatch(payPeriodAction(query));
	};

	const initialFunctionCall = () => {
		dispatch(payPeriodAction({ page: 1, limit: 10 }));
		dispatch(getPeriodDatesAction({}));
	};
	const formatPayPeriodDataHandler = () => {
		const formatPayPeriods = payPeriods.map(
			(singlePayPeriod: any, index: any) => {
				return {
					id: singlePayPeriod.id,
					index: index + 1,
					startDate: singlePayPeriod.startDate,
					endDate: singlePayPeriod.endDate,
					companyId: singlePayPeriod.companyId,
					isEditing: false,
					isError: false,
				};
			}
		);
		setFormateDataCopyObj(formatPayPeriods);
		setFormateData(formatPayPeriods);
	};

	const editClickHandler = (payPeriod: any) => {
		const formDataCopy = JSON.parse(JSON.stringify(formateData));
		const dates = generateDateRange(
			new Date(payPeriod.startDate),
			new Date(payPeriod.endDate)
		);

		const filterDates = payPeriodDates.filter(
			(singeDate: any) => !dates.includes(singeDate)
		);
		setPayPeriodDatesFiltered(filterDates);
		const index = formDataCopy.findIndex(
			(singlePayPeriod: any) => singlePayPeriod.id === payPeriod.id
		);
		formDataCopy[index].isEditing = true;
		setFormateData(formDataCopy);
	};

	const focusChangeHandler = (data: any) => {
		const payPeriod = payPeriods.find(
			(singlePayPeriod: any) => singlePayPeriod.id === data.id
		);

		const dates = generateDateRange(
			new Date(payPeriod.startDate),
			new Date(payPeriod.endDate)
		);

		const filterDates = payPeriodDates.filter(
			(singeDate: any) => !dates.includes(singeDate)
		);
		setPayPeriodDatesFiltered(filterDates);
	};

	const editPayPeriodHandler = (
		payPeriod: any,
		startDate: string,
		endDate: string
	) => {
		const payPeriodObj = payPeriods.find(
			(singlePayPeriod: any) => singlePayPeriod.id === payPeriod.id
		);
		const dates = generateDateRange(
			new Date(payPeriodObj.startDate),
			new Date(payPeriodObj.endDate)
		);
		const filterDates = payPeriodDates.filter(
			(singleItem: any) => !dates.includes(singleItem)
		);
		const isDateExist = isDateRangeDisabled(startDate, endDate, filterDates);
		const formDataCopy = JSON.parse(JSON.stringify(formateData));
		const index = formDataCopy.findIndex(
			(singlePayPeriod: any) => singlePayPeriod.id === payPeriod.id
		);

		if (isDateExist) {
			formDataCopy[index].startDate = formateDataCopyObj[index].startDate;
			formDataCopy[index].endDate = formateDataCopyObj[index].endDate;
			formDataCopy[index].isError = false;
			toastText('Pay Period already exist for selected date ', 'error');
		} else {
			formDataCopy[index].startDate = startDate;
			formDataCopy[index].endDate = endDate;
			formDataCopy[index].isError = false;
		}
		setFormateData(formDataCopy);
	};

	const savePayPeriodHandler = async (payPeriod: any) => {
		const formDataCopy = JSON.parse(JSON.stringify(formateData));
		const index = formDataCopy.findIndex(
			(singlePayPeriod: any) => singlePayPeriod.id === payPeriod.id
		);
		if (payPeriod.startDate && payPeriod.endDate) {
			formDataCopy[index].isEditing = false;
			setFormateData(formDataCopy);
			setFormateDataCopyObj(formDataCopy);
			await dispatch(
				editPeriodAction({
					payPeriodId: payPeriod.id,
					startDate: payPeriod.startDate,
					endDate: payPeriod.endDate,
				})
			)
				.unwrap()
				.then(() => {
					toastText('Payperiod updated successfully', 'success');
				});
			await dispatch(getPeriodDatesAction({}));
		} else {
			formDataCopy[index].isError = true;
			setFormateData(formDataCopy);
		}
	};

	//adding body to scroll to table body Infinite scroll
	const scrollHandler = useCallback((event: any) => {
		const { currentTarget } = event;
		const tableBody = currentTarget?.querySelector('tbody');
		if (
			tableBody?.getBoundingClientRect().top +
				tableBody.getBoundingClientRect().height <
			screen.height - 100
		) {
			setIsInViewPort(true);
		} else {
			setIsInViewPort(false);
		}
	}, []);

	useEffect(() => {
		if (isInViewPort && formateData.length < count) {
			setCurrentPage((prev) => prev + 1);
			let query;
			if (filterValue) {
				query = {
					page: currentPage + 1,
					limit: 10,
					year: filterValue,
				};
			} else {
				query = {
					page: currentPage + 1,
					limit: 10,
				};
			}
			// if (filterValue !== 'all') {
			// 	query['filter'] = filterValue;
			// }
			dispatch(paginateAction(query));
			// paginateRole(
			// 	`page=${currentPage + 1}&limit=10&search=${searchValue}&sort=roleName`
			// )
		}
	}, [isInViewPort]);

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
	useEffect(() => {
		initialFunctionCall();
	}, []);

	useEffect(() => {
		formatPayPeriodDataHandler();
	}, [payPeriods]);
	return (
		<div className={styles['pay-period']}>
			{!isLoading ? (
				<div className={styles['pay-period__wrapper']}>
					<div className={styles['pay-period__table-action-header']}>
						<DynamicTable
							payPeriodDates={payPeriodDatesFiltered}
							payPeriodDatesFiltered={payPeriodDatesFiltered}
							payPeriodData={formateData}
							paginationChangeHandler={paginationChangeHandler}
							currentPage={currentPage}
							totalRecords={10}
							searchValue={searchValue}
							showModal={showModal}
							openDrawerHandler={openDrawerHandler}
							setDrawerInfoHandler={setDrawerInfoHandler}
							setEditSelectedUser={setEditSelectedUser}
							tableRef={tableRef}
							performSortHandler={performSortHandler}
							performFilterHandler={performFilterHandler}
							filterValue={filterValue}
							editClickHandler={editClickHandler}
							savePayPeriodHandler={savePayPeriodHandler}
							editPayPeriodHandler={editPayPeriodHandler}
							formateDataCopy={formateDataCopyObj}
							payPeriodYear={payPeriodYear}
							changeEmployeeCost={(key: string) => changeEmployeeCost(key)}
							focusChangeHandler={focusChangeHandler}
						/>
					</div>
				</div>
			) : (
				<div
					style={{
						position: 'fixed',
						top: 'calc(48vh + 70px)',
						left: 'calc(48vw + 150px)',
					}}
				>
					<Loader />
				</div>
			)}
		</div>
	);
};

export default PayPeriod;

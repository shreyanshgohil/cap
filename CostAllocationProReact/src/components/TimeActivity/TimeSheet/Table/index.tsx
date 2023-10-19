/* eslint-disable @typescript-eslint/no-unused-vars */
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { SortSvgBottom, SortSvgTop } from 'utils/svgs';
import SearchAndFilter from '../SearchAndFilter/index';
import './index.scss';
import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { getTimeSheetsAction, getTimeSheetsPaginateAction } from 'redux/action/timeSheetAction';
import { hasText } from 'utils/utils';
import { useDebounce } from 'use-debounce';
import { getApi } from 'redux/apis';
import { useCallback } from 'react';
import EmployeeListModal from '../EmployeeListModal';

const DynamicTable = () => {
	// Inits
	const { Column } = Table;

	const tableRef = useRef<HTMLDivElement>(null);

	const dispatch = useDispatch<AppDispatch>();

	const {
		data: timeSheetData,
		isLoading,
		count,
	} = useSelector((state: any) => state?.timeSheets);

	const [searchValue, setSearchValue] = useState<string>('');
	const [debounceSearchValue] = useDebounce(searchValue, 1000);

	const [isSearchable, setIsSearchable] = useState(false);

	const [sortBy, setSortBy] = useState<string | null>('');
	const [sortType, setSortType] = useState<string | null>('');

	const [createdBy, setCreatedBy] = useState<string | null>(null);

	const [pageNo, setPageNo] = useState(1);

	const [userOptions, setUserOptions] = useState<any[]>([]);

	const [isInViewPort, setIsInViewPort] = useState<boolean>(false);

	const [payPeriodId, setPayPeriodId] = useState<string | null>(null);

	const [isEmployeeModal, setIsEmployeeModal] = useState<boolean>(false);
	const [selectedTimeSheet, setSelectedTimeSheet] = useState<any>(null);
	const [timeSheetEmployeesData, setTimeSheetEmployeesData] = useState<any>([]);

	useEffect(() => {
		const run = async () => {
			const options = await getApi('/companies/users', {
				companyId: localStorage.getItem('companyId'),
			});

			if (options.data.data) {
				setUserOptions(options.data.data);
			}
		};

		run();
		getTimeSheetsData();
	}, []);

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
		(async () => {
			if (isInViewPort && timeSheetData.length < count) {
				await getTimeSheetsData(true);
			}
		})();
	}, [isInViewPort]);

	useEffect(() => {
		if (isSearchable) {
			getTimeSheetsData();
		}
	}, [debounceSearchValue, createdBy, sortBy, sortType, payPeriodId]);

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


	const tableChangeHandler = (_: unknown, __: unknown, tableData: any) => {
		if (tableData.columnKey && tableData.order) {
			setIsSearchable(true);
			setSortBy(tableData.columnKey);
			setSortType(tableData.order === 'ascend' ? 'asc' : 'desc');
		}
	};

	const getTimeSheetsData = async (isPageable?: boolean) => {
		if(isPageable) {
			setPageNo((prev: any) => prev + 1);
		} else {
			setPageNo(1);
		}

		const query: any = {
			page: isPageable ? pageNo + 1 : 1,
			limit: 10,
			search: searchValue,
			createdBy,
			sort: sortBy,
			type: sortType,
			payPeriodId
		}

		if(!hasText(searchValue)) {
			delete query.search
		}

		if (!hasText(createdBy)) {
			delete query.createdBy;
		}

		if (!hasText(payPeriodId)) {
			delete query.payPeriodId
		}

		if(!sortType || !sortBy) {
			delete query.sort;
			delete query.type
		}

		if(isPageable) {
			await dispatch(getTimeSheetsPaginateAction(query));
			return;
		}
		await dispatch(getTimeSheetsAction(query));
	};

	const handleEmployeeModal = async (data: any) => {
		try {
			const response = await getApi('/time-sheet/employees', {
				companyId: localStorage.getItem('companyId'),
				timeSheetId: data.id,
			});
			setTimeSheetEmployeesData(response.data.data);
			setIsEmployeeModal(true);
			setSelectedTimeSheet(data);
		} catch (err) {
			console.log('Error:', err);
		}
	};

	const closeEmployeeModal = () => {
		setIsEmployeeModal(false);
		setSelectedTimeSheet(null);
		setTimeSheetEmployeesData([]);
	};

	// JSX
	return (
		<div className={'dynamic-table'}>
			<SearchAndFilter
				performSearchHandler={(value: string) => {
					setSearchValue(value);
					setIsSearchable(true);
				}}
				searchValue={searchValue}
				userOptions={userOptions}
				createdBy={createdBy}
				onChangeCreatedBy={(value: string | null) => {
					setCreatedBy(value);
					setIsSearchable(true);
				}}
				payPeriodId={payPeriodId}
				onChangePayPeriodId={(value: string) => {
					setIsSearchable(true);
					setPayPeriodId(value);
				}}
			/>
			<Table
				dataSource={timeSheetData}
				scroll={{ y: '45vh' }}
				pagination={false}
				className="table-global"
				ref={tableRef}
				onChange={tableChangeHandler}
				loading={isLoading}
				rowKey={(record: any) => {
					return record.id;
				}}
			>
				<Column
					title="Timesheet Name"
					dataIndex="name"
					key="name"
					className="bg-white"
					width={'240px'}
					render={(value: string, data: any) => {
						return <a onClick={() => handleEmployeeModal(data)}>{value}</a>;
					}}
				/>
				<Column
					title="Approved Hours"
					dataIndex="approvedHours"
					key="approvedHours"
					width={'180px'}
					className="bg-white"
				/>
				<Column
					title="Created By"
					dataIndex="createdByName"
					key="createdByName"
					className="bg-white"
					defaultSortOrder="ascend"
					showSorterTooltip={{ title: '' }}
					sorter={() => {
						return null as any;
					}}
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={(data) => {
						return data.sortOrder === 'ascend' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
				/>
				<Column
					title="Submitted On"
					dataIndex="submittedOn"
					key="submittedOn"
					className="bg-white"
					render={(value: string) => {
						return <>{new Date(value).toLocaleDateString()}</>;
					}}
				/>
				<Column
					title="Notes"
					dataIndex="notes"
					key="notes"
					className="bg-white"
				/>
				<Column
					title="Cost Allocations"
					dataIndex="Cost Allocations"
					key="status"
					width={'230px'}
					className="bg-white"
					render={() => {
						return (
							<Link key={Math.random()} to={'/'}>
								Review Cost Allocation
							</Link>
						);
					}}
				/>
				<Column
					title="Status"
					dataIndex="status"
					key="status"
					className="bg-white"
					defaultSortOrder="ascend"
					showSorterTooltip={{ title: '' }}
					sorter={() => {
						return null as any;
					}}
					sortDirections={['ascend', 'descend', 'ascend']}
					sortIcon={(data) => {
						return data.sortOrder === 'ascend' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
				/>
			</Table>
			{isEmployeeModal && (
				<EmployeeListModal
					selectedTimeSheet={selectedTimeSheet}
					timeSheetEmployeesData={timeSheetEmployeesData}
					closeEmployeeModal={closeEmployeeModal}
				/>
			)}
		</div>
	);
};

export default DynamicTable;

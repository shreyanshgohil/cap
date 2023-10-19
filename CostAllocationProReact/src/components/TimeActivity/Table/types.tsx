import { ChangeEvent } from 'react';

export interface DynamicTableProps {
	userDataSource: any;
	paginationChangeHandler: (pageNo: number) => void;
	currentPage: number;
	totalRecords: number;
	performSearchHandler: (event: ChangeEvent<HTMLInputElement>) => void;
	performFilterHandler: (data: any, value: any) => void;
	saveAddedItemHandler: (id: string) => void;
	searchValue: string;
	onChangeSearchValue?: any;
	updateTimeLogHandler: (id: string, key: string, value: string) => void;
	filterValue: any;
	showModal: () => void;
	setEditSelectedTimeLog: any;
	tableRef?: any;
	performSortHandler?: (name: string, type: string) => void;
	dateRangeDateHandler: (startDate: any, endDate: any) => void;
	sortHandler: any;
	disableHandler: any;
	updateSavedTimeLog: (
		id: string,
		hours: string,
		classId?: string,
		className?: string,
		customerId?: string,
		customerName?: string
	) => void;
	error: any;
	splitTimeLogHandler: (timeLogData: any) => void;
	dateRangeDate: any;
	cancelSplitHandler: (timeLogData: any) => void;
	subSplitHandler: (
		splitTimeActivity: any,
		timeLog: any,
		index: number
	) => void;
	removeSubSplitHandler: (
		splitTimeActivity: any,
		timeLog: any,
		index: number
	) => void;
	updateSplitActivityHandler: (
		id: string,
		key: string,
		value: string,
		index: number
	) => void;
	updateSplitActivityOnBlur: (
		id: string,
		key: string,
		value: string,
		index: number
	) => any;
	saveSplitTimeLogHandler: (timeLogData: any) => void;
	onResetFilter: (value: any) => void;
	openTables: any;
	setOpenTables: any;
	onChangeYear: any;
	selectedYear: any;
	onChangePayPeriod: (payPeriod: any) => void;
}

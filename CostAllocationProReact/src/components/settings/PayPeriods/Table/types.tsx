export interface DynamicTableProps {
	payPeriodData?: any;
	payPeriodDates: any;
	payPeriodDatesFiltered: any;
	paginationChangeHandler?: (pageNo: number) => void;
	currentPage: number;
	totalRecords: number;
	performFilterHandler: (value: any) => void;
	searchValue: string;
	filterValue: string;
	focusChangeHandler: any;
	showModal: () => void;
	openDrawerHandler: () => void;
	setDrawerInfoHandler: (title: string) => void;
	setEditSelectedUser: any;
	tableRef?: any;
	performSortHandler?: (type: string) => void;
	editClickHandler: (payPeriod: any) => void;
	savePayPeriodHandler: (payPeriod: any) => void;
	formateDataCopy: any;
	editPayPeriodHandler: (
		payPeriod: any,
		startDate: string,
		endString: string
	) => void;
	payPeriodYear: any;
	changeEmployeeCost: (employeeCost: string) => any;
}

import { ChangeEvent } from 'react';
export interface SearchAndFilterProps {
	performSearchHandler: (event: ChangeEvent<HTMLInputElement>) => void;
	performFilterHandler: (data: any, value: any, api?: boolean) => void;
	searchValue: string;
	onChangeSearchValue?: any;
	filterValue: any;
	dateRangeDateHandler: (startDate: any, endDate: any) => void;
	onChangePayPeriod: (payPeriod: string | null) => void;
	onChangeYear: (year: string | null) => void;
	selectedPayPeriod: string | null;
	selectedYear: string | null;
	payPeriodData: any;
}

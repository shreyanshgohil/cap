import { ChangeEvent } from 'react';
export interface SearchAndFilterProps {
	performSearchHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
	performFilterHandler?: (value: any) => void;
	searchValue?: string;
	filterValue?: string;
	payPeriodYear: any;
}

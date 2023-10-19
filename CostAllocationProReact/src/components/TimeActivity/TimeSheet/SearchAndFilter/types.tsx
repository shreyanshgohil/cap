export interface SearchAndFilterProps {
	performSearchHandler: (value: string) => void;
	searchValue: string;
	userOptions: any[];
	createdBy: string | null;
	onChangeCreatedBy: (value: string | null) => void;
	payPeriodId: string | null;
	onChangePayPeriodId: (value: string) => void;
 }

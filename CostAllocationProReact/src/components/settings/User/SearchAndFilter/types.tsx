import { ChangeEvent } from 'react';
export type SearchAndFilterProps = {
	performSearchHandler: (event: ChangeEvent<HTMLInputElement>) => void;
	performFilterHandler: (value: any) => void;
	searchValue: string;
	filterValue: string;
};

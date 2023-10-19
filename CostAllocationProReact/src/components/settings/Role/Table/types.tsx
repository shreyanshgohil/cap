import { ChangeEvent } from 'react';

export type DynamicTableProps = {
	roleColumns: any;
	roleDataSource: any;
	paginationChangeHandler: (pageNo: number) => void;
	currentPage: number;
	totalRecords: number;
	performSearchHandler: (event: ChangeEvent<HTMLInputElement>) => void;
	searchValue: string;
	performFilterHandler: (value: any) => void;
	filterValue: string;
	showModal: () => void;
	openDrawerHandler: () => void;
	setDrawerInfoHandler: (title: string) => void;
	openPermissionsHandler: () => void;
	setEditSelectedRole: any;
	fetchRolePermissions?: (data: any) => void;
	tableRef?: any;
	performSortHandler?: (sortValue: string) => void;
};

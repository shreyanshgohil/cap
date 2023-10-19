import { Space, Switch, Table, Typography } from 'antd';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editRoleActionTable } from 'redux/action/roleTableAction';
import { AppDispatch } from 'redux/store';

import {
	DeleteActionSvg,
	EditActionSvg,
	PermissionDetailsAdminSvg,
	PermissionDetailsSvg,
	SortSvgBottom,
	SortSvgTop,
} from 'utils/svgs';
import SearchAndFilter from '../SearchAndFilter/index';
import styles from './index.module.scss';
import './index.scss';
import { DynamicTableProps } from './types';
import { checkPermission } from 'utils/utils';

const { Text } = Typography;

const DynamicTable: FC<DynamicTableProps> = (props) => {
	const { Column } = Table;
	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const {
		roleDataSource,
		performSearchHandler,
		performFilterHandler,
		searchValue,
		filterValue,
		showModal,
		openDrawerHandler,
		setDrawerInfoHandler,
		openPermissionsHandler,
		setEditSelectedRole,
		fetchRolePermissions,
		tableRef,
		performSortHandler,
	} = props;

	const dispatch = useDispatch<AppDispatch>();

	const editDataHandler = (roleObject: any) => {
		openDrawerHandler();
		setDrawerInfoHandler('Edit Role');
		setEditSelectedRole({
			...roleObject,
			roleName: roleObject?.name,
			roleDescription: roleObject?.description,
		});
	};

	const deleteDataHandler = (roleObject: any) => {
		setEditSelectedRole({
			...roleObject,
			roleName: roleObject?.name,
			roleDescription: roleObject?.description,
		});
	};

	const permissionsHandler = () => {
		openPermissionsHandler();
		setDrawerInfoHandler('Permission Details');
	};

	const statusHandler = (value: any, data: any) => {
		const finalData = {
			roleId: data?.id,
			status: value,
		};
		dispatch(editRoleActionTable(finalData));
	};

	// For handle the table change click
	const tableChangeHandler = (_: any, __: any, data: any) => {
		performSortHandler!(data.order);
	};

	// for check is there edit permission
	const isEditRolePermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Roles',
		permission: ['edit'],
	});

	// for check is there delete permission
	const isDeleteRolePermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Roles',
		permission: ['delete'],
	});

	const isAddRolePermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Roles',
		permission: ['add'],
	});

	// JSX
	return (
		<div className={styles['dynamic-table']}>
			<SearchAndFilter
				performSearchHandler={performSearchHandler}
				searchValue={searchValue}
				performFilterHandler={performFilterHandler}
				filterValue={filterValue}
			/>
			<Table
				dataSource={roleDataSource}
				scroll={{ y: '61vh', x: '63vh' }}
				pagination={false}
				ref={tableRef}
				className="table-global"
				onChange={tableChangeHandler}
			>
				<Column
					sortIcon={(data) => {
						// performSortHandler!(data.sortOrder as string);
						return data.sortOrder === 'ascend' ? (
							<SortSvgTop />
						) : (
							<SortSvgBottom />
						);
					}}
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					sorter={() => {
						return null as any;
					}}
					title={() => {
						return <>Role Name</>;
					}}
					dataIndex="name"
					key="name"
					width={'20%'}
					sortDirections={['ascend', 'descend', 'ascend']}
					className="bg-white"
				/>
				<Column
					title="Description"
					dataIndex="description"
					key="description"
					width={'20%'}
					className="bg-white"
				/>
				<Column
					title="Status"
					dataIndex="status"
					key="status"
					className="bg-white"
					width={'20%'}
					render={(value, rowData: any) => {
						const currentRole = roleDataSource?.find(
							(singleRole: any) => singleRole.id === rowData.id
						);
						return (
							<div className={styles['dynamic-table__status']}>
								{rowData?.isAdmin ? (
									<>
										<PermissionDetailsAdminSvg />
										<Text className={styles['dynamic-table__status--admin']}>
											Enabled
										</Text>
									</>
								) : (
									<Switch
										checked={currentRole.status}
										key={rowData.id}
										defaultChecked={value}
										disabled={!isEditRolePermission}
										onChange={(e) => statusHandler(e, rowData)}
									></Switch>
								)}
							</div>
						);
					}}
				/>
				<Column
					title="Permissions"
					dataIndex="permissions"
					key="permissions"
					className="bg-white"
					width={'20%'}
					render={(_, data: any) => (
						<>
							{data.isAdmin ? (
								<div className={styles['dynamic-table__granted-permission']}>
									<PermissionDetailsAdminSvg />
									<Text
										className={
											styles['dynamic-table__granted-permission--text']
										}
									>
										All Permission Granted
									</Text>
								</div>
							) : (
								<div
									className={`${
										isEditRolePermission === false &&
										isDeleteRolePermission === false &&
										isAddRolePermission === false &&
										'pointer-event-none'
									}`}
									onClick={() => fetchRolePermissions!(data)}
								>
									<PermissionDetailsSvg />
									<Text
										underline
										onClick={permissionsHandler}
										className={styles['dynamic-table__permissions']}
									>
										Permissions Details
									</Text>
								</div>
							)}
						</>
					)}
					// width={'15%'}
				/>
				{(isEditRolePermission || isDeleteRolePermission) && (
					<Column
						title="Action"
						dataIndex="action"
						key="action"
						className="bg-white"
						width={'20%'}
						render={(value, data: any) => (
							<Space size={20}>
								{!data.isAdmin ? (
									<>
										{isEditRolePermission && (
											<div
												className="cursor-pointer flex align-center justify-center"
												onClick={() => editDataHandler(data)}
											>
												<EditActionSvg />
											</div>
										)}
										{isDeleteRolePermission && (
											<div
												className="cursor-pointer flex align-center justify-center"
												onClick={() => {
													deleteDataHandler(data);
													showModal();
												}}
											>
												<DeleteActionSvg />
											</div>
										)}
									</>
								) : null}
							</Space>
						)}
					/>
				)}
			</Table>
		</div>
	);
};

export default DynamicTable;

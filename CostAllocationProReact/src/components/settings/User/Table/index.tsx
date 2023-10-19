/* eslint-disable react-hooks/rules-of-hooks */
import { Space, Switch, Table } from 'antd';
import { FC } from 'react';
import {
	DeleteActionSvg,
	EditActionSvg,
	SortSvgBottom,
	SortSvgTop,
} from 'utils/svgs';
import SearchAndFilter from '../SearchAndFilter/index';
import './index.scss';
import { DynamicTableProps } from './types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { editUserAction } from 'redux/action/userAction';
import { checkPermission } from 'utils/utils';

const DynamicTable: FC<DynamicTableProps> = (props) => {
	// Inits
	const { Column } = Table;
	const {
		userDataSource,
		performSearchHandler,
		performFilterHandler,
		searchValue,
		filterValue,
		showModal,
		openDrawerHandler,
		setDrawerInfoHandler,
		setEditSelectedUser,
		tableRef,
		performSortHandler,
	} = props;

	const dispatch = useDispatch<AppDispatch>();

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const editDataHandler = (userObject: any) => {
		openDrawerHandler();
		setDrawerInfoHandler('Edit User');
		setEditSelectedUser(userObject);
	};

	const deleteDataHandler = (userObject: any) => {
		setEditSelectedUser(userObject);
	};

	const statusHandler = (value: any, data: any) => {
		const finalData = {
			roleId: data?.roleId,
			userId: data?.userId,
			status: value,
			isChangeStatus: true,
		};
		dispatch(editUserAction(finalData));
	};

	// For handle the table change click
	const tableChangeHandler = (_: any, __: any, data: any) => {
		performSortHandler!(data.order);
	};

	// for check is there edit permission
	const isEditUserPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Users',
		permission: ['edit'],
	});
	// for check is there delete permission
	const isDeleteUserPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Users',
		permission: ['delete'],
	});

	// JSX
	return (
		<div className={'dynamic-table'}>
			<SearchAndFilter
				performSearchHandler={performSearchHandler}
				searchValue={searchValue}
				performFilterHandler={performFilterHandler}
				filterValue={filterValue}
			/>
			<Table
				dataSource={userDataSource}
				scroll={{ y: '61vh', x: '63vh' }}
				pagination={false}
				className="table-global"
				ref={tableRef}
				onChange={tableChangeHandler}
			>
				<Column
					title="User Name"
					dataIndex="name"
					key="name"
					showSorterTooltip={{ title: '' }}
					defaultSortOrder="ascend"
					sorter={() => {
						return null as any;
					}}
					className="bg-white"
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
					title="Email Address"
					dataIndex="email"
					key="email"
					className="bg-white"
					// width={'379px'}
				/>
				<Column
					title="Phone Number"
					dataIndex="phone"
					key="phone"
					className="bg-white"
					// width={'314px'}
				/>
				<Column
					title="Role"
					dataIndex="role"
					key="role"
					className="bg-white"
					width={'15%'}
					// width={'261px'}
				/>
				<Column
					title="Status"
					dataIndex="status"
					key="status"
					className="bg-white"
					width={'10%'}
					// width={'176px'}
					render={(value: any, data: any) => {
						return (
							<Switch
								key={Math.random()}
								defaultChecked={value}
								disabled={
									data?.isCompanyAdmin ||
									!data.roleStatus ||
									!isEditUserPermission
								}
								onChange={(e) => statusHandler(e, data)}
							></Switch>
						);
					}}
				/>
				{(isEditUserPermission || isDeleteUserPermission) && (
					<Column
						title="Action"
						dataIndex="action"
						key="action"
						className="bg-white"
						width={'15%'}
						render={(values, data: any) => {
							return (
								<Space size={20}>
									{!(data.isCompanyAdmin || data.isAdmin) ? (
										<>
											{isEditUserPermission && (
												<div
													className="cursor-pointer flex align-center justify-center"
													onClick={() => editDataHandler(data)}
												>
													<EditActionSvg />
												</div>
											)}
											{isDeleteUserPermission && (
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
							);
						}}
					/>
				)}
			</Table>
		</div>
	);
};

export default DynamicTable;

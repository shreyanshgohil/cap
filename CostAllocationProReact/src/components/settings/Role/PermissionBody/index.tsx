import { Checkbox, Table, Typography } from 'antd';
import { permissionObject } from 'constants/Data';
import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updatePermissionsAction } from 'redux/action/permissionAction';
import { getPermissionObject, toastText } from 'utils/utils';
import styles from './index.module.scss';
import './index.scss';
import { PermissionProps, SideDrawerBodyProps } from './types';
import { AppDispatch } from 'redux/store';

const { Text } = Typography;

const PermissionBody: FC<SideDrawerBodyProps> = (props) => {
	// Inits
	const { Column } = Table;
	const [allSelection, setAllSelection] = useState({
		all: false,
		edit: false,
		view: false,
		delete: false,
		add: false,
	});
	const { permissions, closeDrawerByAnimation, selectedRole } = props;
	const formattedPermissionData = getPermissionObject(
		permissionObject,
		permissions
	);

	const [permissionsCopy, setPermissionsCopy] = useState(
		formattedPermissionData
	);
	const dispatch = useDispatch<AppDispatch>();
	// For get the permission object with it's module so we can show it as module

	const savePermissionHandler = async () => {
		try {
			// removing the header permission
			const actualPermissions = permissionsCopy.filter(
				(singlePermission: any) => singlePermission.id
			);

			const data = {
				orgId: localStorage.getItem('companyId'),
				roleId: selectedRole.id,
				permissions: actualPermissions,
			};
			dispatch(updatePermissionsAction(data));
			// const response = await postApi('/permission/update-permission', data);
			// dispatch(updatePermissionHandler(permissionsCopy));
			closeDrawerByAnimation();
		} catch (error) {
			toastText('Something went wrong', 'error');
			console.error(error);
		}
	};

	// for handle the all permission of role
	const allPermissionChangeHandler = (e: any, permissionName: string) => {
		setAllSelection((prev) => {
			return {
				...prev,
				[permissionName]: e.target.checked,
			};
		});
		for (const singlePermission of permissionsCopy) {
			if (Object.prototype.hasOwnProperty.call(singlePermission, 'all')) {
				PermissionChangeHandler(singlePermission, e, permissionName);
			}
		}
	};

	// For check is there all are true out there
	const checkAllTrue = (listOfPermission: any) => {
		const tempCopy: any = { ...allSelection };
		const keys: any = Object.keys(tempCopy);
		for (const singleKey of keys) {
			const isAllPermission = listOfPermission.every(
				(singlePermission: any) => {
					if (Object.prototype.hasOwnProperty.call(singlePermission, 'all')) {
						return singlePermission[singleKey];
					} else {
						return true;
					}
				}
			);
			tempCopy[singleKey] = isAllPermission;
		}
		setAllSelection(tempCopy);
	};

	// For function initial call
	const initialCall = () => {
		checkAllTrue(permissionsCopy);
	};

	// For initial call of function
	useEffect(() => {
		initialCall();
	}, []);

	const PermissionChangeHandler = (
		data: any,
		e: any,
		permissionName: string
	) => {
		setPermissionsCopy((prevState: any) => {
			const PermissionUpdate = prevState.map((item: any) => {
				let duplicateItem = { ...item };
				if (item.id === data.id) {
					if (e.target.checked) {
						if (permissionName === 'all') {
							duplicateItem = {
								...duplicateItem,
								all: true,
								view: true,
								edit: true,
								delete: true,
								add: true,
							};
						} else if (permissionName === 'add') {
							duplicateItem = {
								...duplicateItem,
								view: true,
								add: true,
							};
						} else if (permissionName === 'edit') {
							duplicateItem = {
								...duplicateItem,
								view: true,
								edit: true,
							};
						} else if (permissionName === 'delete') {
							duplicateItem = {
								...duplicateItem,
								view: true,
								delete: true,
							};
						} else {
							duplicateItem = {
								...duplicateItem,
								view: true,
							};
						}
						duplicateItem[permissionName] = true;
						const propertyNames = Object.keys(duplicateItem).filter(
							(key) => key !== 'moduleName' && key !== 'all' && key !== 'isBold'
						);
						const anyFalseValue = propertyNames.some(
							(key) => duplicateItem[key] === false
						);
						duplicateItem.all = !anyFalseValue;
						return duplicateItem;
					} else {
						if (permissionName === 'all' || permissionName === 'view') {
							return {
								...item,
								all: false,
								view: false,
								edit: false,
								delete: false,
								add: false,
							};
						} else {
							return { ...item, [permissionName]: false, all: false };
						}
					}
				}

				return duplicateItem;
			});
			checkAllTrue(PermissionUpdate);
			return PermissionUpdate;
		});
	};
	// JSX
	return (
		<div className={'permission-details-drawer'}>
			<Table
				// columns={permissionColumn}
				dataSource={permissionsCopy}
				pagination={false}
				sticky={true}
				className={`${styles['dynamic-permission-table']} table-global`}
				rowClassName={(columnData: any) => {
					if (columnData.isBold) {
						return 'table-weight-700';
					} else {
						return '';
					}
				}}
			>
				<Column
					title={'Module Name'}
					dataIndex="permissionName"
					key="moduleName"
					width={'40%'}
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					render={(value: string, rowData: PermissionProps, _: any) => {
						return (
							<Text
								className={
									rowData?.isParentModule == true
										? 'parent-module'
										: 'child-module'
								}
							>
								{value}
							</Text>
						);
					}}
				/>
				<Column
					title={() => {
						return (
							<div className="module-name">
								<div className="select-all">
									<Checkbox
										defaultChecked={false}
										checked={allSelection.all}
										onChange={(e) => allPermissionChangeHandler(e, 'all')}
									></Checkbox>
								</div>
								<div className="module-name--title">
									<p>All </p>
								</div>
							</div>
						);
					}}
					dataIndex="all"
					key="all"
					width={'15%'}
					render={(value: boolean, rowData: PermissionProps) => {
						return (
							<>
								{rowData?.sortId ? (
									<Checkbox
										checked={value}
										defaultChecked={value}
										onChange={(e) => PermissionChangeHandler(rowData, e, 'all')}
									></Checkbox>
								) : (
									` `
								)}
							</>
						);
					}}
				/>
				<Column
					title={() => {
						return (
							<div className="module-name">
								<div className="select-all">
									<Checkbox
										defaultChecked={false}
										checked={allSelection.add}
										onChange={(e) => allPermissionChangeHandler(e, 'add')}
									></Checkbox>
								</div>
								<div className="module-name--title">
									<p>Add</p>
								</div>
							</div>
						);
					}}
					dataIndex="add"
					key="add"
					width={'15%'}
					render={(value: boolean, rowData: PermissionProps) => {
						return (
							<>
								{rowData?.sortId ? (
									<Checkbox
										checked={value}
										defaultChecked={value}
										onChange={(e) => PermissionChangeHandler(rowData, e, 'add')}
									></Checkbox>
								) : (
									` `
								)}
							</>
						);
					}}
				/>
				<Column
					title={() => {
						return (
							<div className="module-name">
								<div className="select-all">
									<Checkbox
										defaultChecked={false}
										checked={allSelection.view}
										onChange={(e) => allPermissionChangeHandler(e, 'view')}
									></Checkbox>
								</div>
								<div className="module-name--title">
									<p>View</p>
								</div>
							</div>
						);
					}}
					dataIndex="view"
					key="view"
					width={'15%'}
					render={(value: boolean, rowData: PermissionProps) => (
						<>
							{rowData?.sortId ? (
								<Checkbox
									checked={value}
									defaultChecked={value}
									onChange={(e) => PermissionChangeHandler(rowData, e, 'view')}
								></Checkbox>
							) : (
								` `
							)}
						</>
					)}
				/>
				<Column
					title={() => {
						return (
							<div className="module-name">
								<div className="select-all">
									<Checkbox
										defaultChecked={false}
										checked={allSelection.edit}
										onChange={(e) => allPermissionChangeHandler(e, 'edit')}
									></Checkbox>
								</div>
								<div className="module-name--title">
									<p>Edit</p>
								</div>
							</div>
						);
					}}
					dataIndex="edit"
					key="edit"
					width={'15%'}
					render={(value: boolean, rowData: PermissionProps) => (
						<>
							{rowData?.sortId ? (
								<Checkbox
									checked={value}
									defaultChecked={value}
									onChange={(e) => PermissionChangeHandler(rowData, e, 'edit')}
								></Checkbox>
							) : (
								` `
							)}
						</>
					)}
				/>
				<Column
					title={() => {
						return (
							<div className="module-name">
								<div className="select-all">
									<Checkbox
										defaultChecked={false}
										checked={allSelection.delete}
										onChange={(e) => allPermissionChangeHandler(e, 'delete')}
									></Checkbox>
								</div>
								<div className="module-name--title">
									<p>Delete</p>
								</div>
							</div>
						);
					}}
					dataIndex="delete"
					key="delete"
					width={'15%'}
					render={(value: boolean, rowData: PermissionProps) => (
						<>
							{rowData?.sortId ? (
								<Checkbox
									checked={value}
									defaultChecked={value}
									onChange={(e) =>
										PermissionChangeHandler(rowData, e, 'delete')
									}
								></Checkbox>
							) : (
								` `
							)}
						</>
					)}
				/>
			</Table>
			<div className={styles['side-drawer-form']}>
				<div className={styles['side-drawer-form__buttons']}>
					<button
						onClick={savePermissionHandler}
						className={`${styles['side-drawer-form__buttons--save']} ${styles['side-drawer-form__buttons--btn']}`}
					>
						Save
					</button>
					<button
						className={`${styles['side-drawer-form__buttons--cancel']} ${styles['side-drawer-form__buttons--btn']}`}
						onClick={closeDrawerByAnimation}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default PermissionBody;

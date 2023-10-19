import {
	Loader,
	SideDrawerWrapper,
	TableActionHeader,
} from 'components/Global';
import ConfirmDelete from 'components/Global/confirmDeleteModel';
import { userColumns } from 'constants/Data';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleAction } from 'redux/action/roleActions';
import {
	deleteUserAction,
	getUsersAction,
	paginateUserAction,
} from 'redux/action/userAction';
import { AppDispatch } from 'redux/store';
import { AddSvg } from 'utils/svgs';
import { checkPermission, formatPhoneNumber } from 'utils/utils';
import AddUserBody from './AddUserBody';
import DynamicTable from './Table';
import styles from './index.module.scss';

// Creating the list of user table
const UsersTable = () => {
	const [drawerAnimation, setDrawerAnimation] = useState<boolean>(false);
	const [isSideDrawerOpen, setSideDrawerOpen] = useState<boolean>(false);
	const [isInViewPort, setIsInViewPort] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');
	const [filterValue, setFilterValue] = useState('');
	const [drawerInfo, setDrawerInfo] = useState({
		drawerTitle: 'Users',
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editSelectedUser, setEditSelectedUser] = useState<any>();
	const [formateData, setFormateData] = useState<any>([]);

	const tableRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const {
		data: userData,
		count,
		isLoading,
		fistTimeFetchLoading,
	} = useSelector((state: any) => state?.users);

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	useEffect(() => {
		fetchUsers();
	}, []);

	useEffect(() => {
		const data = userData?.map((user: any) => {
			const phone = user?.user?.phone
				? formatPhoneNumber(user?.user?.phone?.toString())
				: user?.user?.phone;
			return {
				id: user?.id,
				userId: user?.userId,
				name:
					(user?.user?.firstName || '') + ' ' + (user?.user?.lastName || ''),
				email: user?.user?.email,
				phone: phone,
				simplePhone: user?.user?.phone,
				role: user?.role?.roleName,
				roleId: user?.roleId,
				status: user?.status,
				isAdmin: user?.role?.isAdminRole,
				isCompanyAdmin: user?.role?.isCompanyAdmin,
				roleStatus: user.role.status,
			};
		});
		setFormateData(data);
	}, [userData]);

	const fetchUsers = () => {
		dispatch(
			getUsersAction({
				page: currentPage,
				limit: 10,
			})
		);
		dispatch(
			getRoleAction({
				url: `page=${1}&limit=1000000`,
			})
		);
	};

	// Remove from drawer handler
	const removeDrawerFromDom = () => {
		setSideDrawerOpen(false);
	};
	// For open the sideDrawer with animation
	const openDrawerHandler = () => {
		setDrawerInfo({ drawerTitle: 'Add Users' });
		setDrawerAnimation(true);
		setSideDrawerOpen(true);
	};

	// For perform the close animation
	const closeDrawerByAnimation = () => {
		setEditSelectedUser(undefined);
		setDrawerAnimation(false);
	};

	// Handle the pagination for the table
	const paginationChangeHandler = (pageNo: number) => {
		setCurrentPage(pageNo);
	};

	// For perform the search operation
	const performSearchHandler = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setSearchValue(value.trimStart());
		if (value.trimStart().length >= 3) {
			dispatch(
				getUsersAction({
					page: currentPage,
					limit: 10,
					search: value,
					filter: filterValue,
				})
			);
		} else {
			if (value.trimStart().length !== 0 || value === '') {
				dispatch(
					getUsersAction({
						page: currentPage,
						limit: 10,
						search: '',
						filter: filterValue,
					})
				);
			}
		}

		setCurrentPage(1);
	};

	// Perform Filter
	const performFilterHandler = (value: any) => {
		if (value == 'all') {
			dispatch(
				getUsersAction({
					page: 1,
					limit: 10,
					search: searchValue,
				})
			);
		} else {
			dispatch(
				getUsersAction({
					page: 1,
					limit: 10,
					search: searchValue,
					filter: value === 'active' ? true : false,
				})
			);
		}
		setFilterValue(() => {
			return value === 'active' ? 'true' : 'false';
		});
	};

	//   For open the model
	const showModal = () => {
		setIsModalOpen(true);
	};

	// For change the data and title between components
	const setDrawerInfoHandler = (drawerTitle: any) => {
		setDrawerInfo({ drawerTitle });
	};

	//   For conform operation
	const handleOk = () => {
		setIsModalOpen(false);
	};

	//   For cancel operation
	const handleCancel = () => {
		setIsModalOpen(false);
	};

	// Delete User
	const deleteHandler = () => {
		if (editSelectedUser) {
			dispatch(deleteUserAction(editSelectedUser)).then(() => {
				setIsModalOpen(false);
				setEditSelectedUser(undefined);
			});
		}
	};

	//adding body to scroll to table body Infinite scroll
	const scrollHandler = useCallback((event: any) => {
		const { currentTarget } = event;
		const tableBody = currentTarget?.querySelector('tbody');
		if (
			tableBody!.getBoundingClientRect().top +
				tableBody.getBoundingClientRect().height <
			screen.height - 100
		) {
			setIsInViewPort(true);
		} else {
			setIsInViewPort(false);
		}
	}, []);

	useEffect(() => {
		if (isInViewPort && formateData.length < count) {
			setCurrentPage((prev) => prev + 1);

			let query;
			if (filterValue == 'all') {
				query = {
					page: currentPage + 1,
					limit: 10,
					search: searchValue,
					sort: 'asc',
				};
			} else {
				query = {
					page: currentPage + 1,
					limit: 10,
					search: searchValue,
					sort: 'asc',
					filer: filterValue,
				};
			}

			// if (filterValue !== 'all') {
			// 	query['filter'] = filterValue;
			// }

			dispatch(paginateUserAction(query));
			// paginateRole(
			// 	`page=${currentPage + 1}&limit=10&search=${searchValue}&sort=roleName`
			// )
		}
	}, [isInViewPort]);

	// For perform the sorting operation
	const performSortHandler = (type: string) => {
		setCurrentPage(1);
		dispatch(
			getUsersAction({
				page: 1,
				limit: 10,
				sort: 'firstName',
				type: type === 'ascend' ? 'asc' : 'desc',
			})
		);
	};

	useEffect(() => {
		if (tableRef.current) {
			const tableBody = tableRef.current
				? tableRef.current?.querySelector('.ant-table-body')
				: null;
			// if (tableBody) {
			tableBody?.addEventListener('scroll', scrollHandler);
			return () => tableBody?.removeEventListener('scroll', scrollHandler);
			// }
		}
	}, [tableRef.current]);

	// for check is there add permission
	const isAddUserPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Users',
		permission: ['add'],
	});

	// JSX
	return (
		<>
			<div className={styles['user-table']}>
				{!fistTimeFetchLoading ? (
					<div>
						<TableActionHeader title={'User'}>
							<div className={styles['user-table__action']}>
								{localStorage.getItem('companyId') !== 'undefined' &&
									isAddUserPermission && (
										<button
											className={`btn-black ${styles['user-table__action--button']}`}
											onClick={openDrawerHandler}
										>
											<AddSvg />
											<p>Add User</p>
										</button>
									)}
							</div>
						</TableActionHeader>
						<div>
							<DynamicTable
								userDataSource={formateData}
								userColumns={userColumns}
								paginationChangeHandler={paginationChangeHandler}
								currentPage={currentPage}
								totalRecords={10}
								performSearchHandler={performSearchHandler}
								searchValue={searchValue}
								showModal={showModal}
								openDrawerHandler={openDrawerHandler}
								setDrawerInfoHandler={setDrawerInfoHandler}
								setEditSelectedUser={setEditSelectedUser}
								tableRef={tableRef}
								performSortHandler={performSortHandler}
								performFilterHandler={performFilterHandler}
								filterValue={filterValue}
							/>
						</div>
					</div>
				) : (
					<Loader />
				)}
			</div>
			<ConfirmDelete
				handleCancel={handleCancel}
				handleOk={handleOk}
				isModalOpen={isModalOpen}
				deleteHandler={deleteHandler}
				isLoading={isLoading}
			/>
			{isSideDrawerOpen && (
				<SideDrawerWrapper
					isOpen={drawerAnimation}
					removeDrawerFromDom={removeDrawerFromDom}
					closeDrawerByAnimation={closeDrawerByAnimation}
					headerTitle={drawerInfo.drawerTitle}
					position="right"
					width="half"
				>
					<AddUserBody
						closeDrawerByAnimation={closeDrawerByAnimation}
						editSelectedUser={editSelectedUser}
						setEditSelectedUser={setEditSelectedUser}
					/>
				</SideDrawerWrapper>
			)}
		</>
	);
};

export default UsersTable;

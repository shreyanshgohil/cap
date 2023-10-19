import { Col, Image, Row, Select } from 'antd';
import UserProfileModal from 'components/Profile';
import { SettingsBody } from 'components/settings';
import { FORMDATA } from 'constants/Data';
import SettingsLayout from 'layouts/Settings';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCompanyDetails } from 'redux/slice/companySlice';
import { logoutAction } from 'redux/slice/loginSlice';
import { AppDispatch } from 'redux/store';
import { checkPermission } from 'utils/utils';
import SideDrawerWrapper from '../SideDrawerWrapper';
import UserNameBox from '../UserNameBox';
import styles from './index.module.scss';
import './index.scss';
// Website header
const Header = () => {
	// Inits
	const { settingsMenuItems } = FORMDATA;
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [drawerAnimation, setDrawerAnimation] = useState<boolean>(false);
	const [isSideDrawerOpen, setSideDrawerOpen] = useState<boolean>(false);
	const [filteredMenuItems, setFilteredMenuItems] = useState<any>([]);

	const [searchParams] = useSearchParams();

	const openDrawerFlag = searchParams.get('openDrawer');

	// const settingsItem = localStorage.getItem('settings') || 'Users';

	const [settingsItem, setSettingsItem] = useState<any>(
		localStorage.getItem('settings') || 'Users'
	);
	const [selectedSidebar, setSelectedSidebar] = useState<string>(settingsItem);
	const [drawerInfo] = useState({
		drawerTitle: 'Settings',
	});
	const [isProfileModalOpen, setProfileModalOpen] = useState<boolean>(false);
	const [organizationOptions, setOrganizationOptions] = useState<any>([]);
	const [selectedOrganization, setSelectedOrganization] = useState<any>(
		localStorage.getItem('companyId') || ''
	);

	const [isLogoutLoading, setIsLogoutLoading] = useState(false);

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const { data: listOfCompanies } = useSelector(
		(state: any) => state?.companies
	);

	const { data: userData } = useSelector((state: any) => state?.userProfile);

	useEffect(() => {
		const settingsItem = localStorage.getItem('settings');
		if (settingsItem) {
			setDrawerAnimation(true);
			setSideDrawerOpen(true);
		}
		setSettingsItem(settingsItem);
	}, [settingsItem]);

	useEffect(() => {
		const companies = userData?.companies?.map((company: any) => {
			return {
				companyId: company.company?.id,
				companyName: company.company?.tenantName,
			};
		});
		setOrganizationOptions(companies);
	}, [userData]);

	// For remove from the dom
	const removeDrawerFromDom = () => {
		setSideDrawerOpen(false);
	};
	// For open the sideDrawer with animation
	const openDrawerHandler: any = () => {
		setDrawerAnimation(true);
		setSideDrawerOpen(true);
	};

	useEffect(() => {
		if (openDrawerFlag === 'true') {
			openDrawerHandler();
		}
	}, [openDrawerFlag]);

	useEffect(() => {
		if (listOfCompanies && !listOfCompanies?.length) {
			openDrawerHandler();
		}
	}, [listOfCompanies]);

	// For perform the close animation
	const closeDrawerByAnimation = () => {
		setDrawerAnimation(false);
		filterSettingsMenuHandler();
		localStorage.removeItem('settings');
	};

	// for handle the change of the sidebar
	const sideBarChangeHandler = (selectedValue: any) => {
		localStorage.setItem('settings', selectedValue?.key);
		setSelectedSidebar(selectedValue?.key);
	};

	// Logout Handler

	const logoutHandler = () => {
		setIsLogoutLoading(true);
		dispatch(logoutAction() as any)
			.unwrap()
			.then(() => {
				setIsLogoutLoading(false);
				navigate('/login');
			})
			.catch(() => {
				setIsLogoutLoading(false);
				navigate('/');
			});
	};

	// My Profile Handler
	const myProfileHandler = () => {
		setProfileModalOpen(true);
	};

	const profileCancel = () => {
		setProfileModalOpen(false);
	};

	const organizationChangeHandler = (e: any, data: any) => {
		localStorage.setItem('companyId', e);
		localStorage.setItem('companyName', data?.children);
		setSelectedOrganization(e);
		dispatch(getCompanyDetails(e));
	};

	userData?.companies?.find(
		(singleCompany: any) => singleCompany.companyId === selectedOrganization
	);

	const filterSettingsMenuHandler = () => {
		const filteredPermissionsState = settingsMenuItems.map(
			(singleMenuItem: any) => {
				return checkPermission(selectedCompanyPermission, {
					permissionName: singleMenuItem?.key,
					permission: ['view'],
				});
			}
		);

		if (!listOfCompanies?.length) {
			filteredPermissionsState[2] = true;
		}

		const filteredMenuItems = settingsMenuItems.filter(
			(_, i) => filteredPermissionsState[i]
		);

		setFilteredMenuItems(filteredMenuItems);

		setSelectedSidebar(filteredMenuItems[0]?.key);
	};

	const isAnyUserPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Users',
		permission: ['add', 'all', 'edit', 'view', 'delete'],
	});
	const isAnyRolePermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Roles',
		permission: ['add', 'all', 'edit', 'view', 'delete'],
	});

	const isAnyIntegrationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Integrations',
			permission: ['add', 'all', 'edit', 'view', 'delete'],
		}
	);

	const isAnySubscriptionPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Subscriptions',
			permission: ['add', 'all', 'edit', 'view', 'delete'],
		}
	);

	const isAnyConfigurationPermission = checkPermission(
		selectedCompanyPermission,
		{
			permissionName: 'Configurations',
			permission: ['add', 'all', 'edit', 'view', 'delete'],
		}
	);

	const isAnyCustomRulePermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Custom Rules',
		permission: ['add', 'all', 'edit', 'view', 'delete'],
	});

	useEffect(() => {
		filterSettingsMenuHandler();
	}, [selectedCompanyPermission, listOfCompanies]);

	// JSX
	return (
		<>
			<header className={styles['header']}>
				<Row
					className={styles['header__wrapper']}
					align={'middle'}
					justify={'space-between'}
				>
					<Col className={styles['header__details-left']}>
						<div className={styles['header__details-left--logo']}>
							<Image
								src="/assets/images/cap-logo.png"
								preview={false}
								alt="group"
							/>
						</div>
					</Col>
					<Col className={styles['header__details-right']}>
						{organizationOptions?.length > 0 && (
							<Select
								placeholder="Select Organization"
								className={styles['header__details-right--organization']}
								onChange={(e, data) => organizationChangeHandler(e, data)}
								defaultValue={
									selectedOrganization == 'undefined' || !selectedOrganization
										? 'Select Organization'
										: selectedOrganization
								}
								value={
									selectedOrganization == 'undefined' || !selectedOrganization
										? 'Select Organization'
										: selectedOrganization
								}
							>
								{organizationOptions?.map((company: any, key: number) => (
									<Select.Option value={company?.companyId} key={key}>
										{company?.companyName}
									</Select.Option>
								))}
							</Select>
						)}

						{(isAnyConfigurationPermission ||
							listOfCompanies?.length === 0 ||
							isAnyIntegrationPermission ||
							isAnyRolePermission ||
							isAnySubscriptionPermission ||
							isAnyCustomRulePermission ||
							isAnyUserPermission) && (
							<div
								className={styles['header__details-right--settings']}
								onClick={() => {
									openDrawerHandler();
									if (isAnyUserPermission) {
										localStorage.setItem('settings', 'Users');
									} else if (isAnyRolePermission) {
										localStorage.setItem('settings', 'Roles');
									} else if (isAnyIntegrationPermission) {
										localStorage.setItem('settings', 'Integrations');
									} else if (isAnyConfigurationPermission) {
										localStorage.setItem('settings', 'Configurations');
									} else if (isAnyCustomRulePermission) {
										localStorage.setItem('settings', 'CustomRules');
									}
								}}
							>
								<Image
									src="/assets/images/settings.png"
									preview={false}
									alt="group"
								/>
							</div>
						)}

						<div className={styles['header__details-right--user']}>
							<div className={styles['header__details-right--user-logo']}>
								<UserNameBox
									name={`${userData?.firstName} ${userData?.lastName}`}
									imageUrl={
										userData?.profileImg &&
										`${process.env.REACT_APP_AWS_BASE_URL}${userData?.profileImg}`
									}
								/>
							</div>
							<div className={styles['header__details-right--user-details']}>
								<p className={styles['header__details-right--user-name']}>
									{userData?.firstName} {userData?.lastName}
								</p>
								<p
									className={styles['header__details-right--user-profile']}
									onClick={myProfileHandler}
								>
									My Profile
								</p>
							</div>
						</div>
						<div className={styles['header__details-right--user-logout']}>
							<div
								className={isLogoutLoading ? 'pointer-event-none' : ''}
								onClick={logoutHandler}
							>
								<Image
									src="/assets/images/logout.png"
									preview={false}
									alt="group"
								/>
							</div>
						</div>
					</Col>
				</Row>
			</header>

			{isSideDrawerOpen && (
				<SideDrawerWrapper
					isOpen={drawerAnimation}
					removeDrawerFromDom={removeDrawerFromDom}
					closeDrawerByAnimation={closeDrawerByAnimation}
					headerTitle={drawerInfo.drawerTitle}
					position="bottom"
					width="full"
				>
					<SettingsLayout
						filteredMenuItems={filteredMenuItems}
						onSideBarChange={sideBarChangeHandler}
						selectedSidebar={selectedSidebar}
					>
						<SettingsBody
							selectedSidebar={selectedSidebar}
							setSelectedSidebar={setSelectedSidebar}
							closeDrawerByAnimation={closeDrawerByAnimation}
							openDrawerHandler={openDrawerHandler}
						/>
					</SettingsLayout>
				</SideDrawerWrapper>
			)}

			{isProfileModalOpen && (
				<UserProfileModal
					isProfileModalOpen={isProfileModalOpen}
					handleCancel={profileCancel}
				/>
			)}
		</>
	);
};

export default Header;

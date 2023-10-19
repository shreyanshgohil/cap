import { Header, Sidebar } from 'components/Global';
import { FORMDATA } from 'constants/Data';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	Outlet,
	useLocation,
	useNavigate,
	// useSearchParams,
} from 'react-router-dom';
import { checkPermission } from 'utils/utils';
import styles from './index.module.scss';
// Creating the global layout for along all the pages
const GlobalLayout = () => {
	// inits
	const { pageMenuItems } = FORMDATA;
	const { isLoading } = useSelector((state: any) => state.userProfile);
	const { pathname } = useLocation();
	const [finalMenuItems, setMenuItems] = useState<any>([]);

	const navigate = useNavigate();

	// const [queryParams] = useSearchParams();

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isDashboardPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Dashboard',
		permission: ['view'],
	});

	const isEmployeePermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Employee Cost',
		permission: ['view'],
	});

	const isTimeLogPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Time Logs',
		permission: ['view'],
	});

	useEffect(() => {
		let menuItems = pageMenuItems;
		if (!isDashboardPermission) {
			menuItems = menuItems?.filter((item) => item?.key !== 'dashboard');
		}
		if (!isEmployeePermission) {
			menuItems = menuItems?.filter((item) => item?.key !== 'employee-costs');
		}

		if (!isTimeLogPermission) {
			menuItems = menuItems?.filter((item) => item?.key !== 'time-activity');
		}

		setMenuItems(menuItems);
	}, [
		isEmployeePermission,
		isTimeLogPermission,
		isDashboardPermission,
		pageMenuItems,
	]);

	const [selectedSidebar, setSelectedSidebar] = useState<string>('dashboard');

	const handleSidebar = (sidebarProps: any) => {
		if (sidebarProps?.key === 'employee-costs') {
			setSelectedSidebar('employee-costs');
			navigate('/employee-costs');
		} else if (sidebarProps?.key === 'time-activity') {
			setSelectedSidebar('time-activity');
			navigate('/time-activity');
		} else {
			setSelectedSidebar('dashboard');
			navigate(`/`);
		}
	};
	const initialFunctionCall = () => {
		if (pathname === '/employee-costs') {
			setSelectedSidebar('employee-costs');
		} else if (pathname === '/time-activity') {
			setSelectedSidebar('time-activity');
		} else {
			setSelectedSidebar('dashboard');
		}
	};

	useEffect(() => {
		initialFunctionCall();
	}, [pathname]);

	// JSX
	return !isLoading ? (
		<div className={styles['global-layout']}>
			<div className={styles['global-layout__wrapper']}>
				<div className={styles['global-layout__header']}>
					<Header />
				</div>
				<div className={styles['global-layout__body']}>
					<div className={styles['global-layout__body--sidebar']}>
						<Sidebar
							items={finalMenuItems}
							// items={pageMenuItems}
							isGetSupportButton={false}
							handleSidebar={handleSidebar}
							selectedSidebar={selectedSidebar}
						/>
					</div>

					<div className={styles['global-layout__body--body']}>
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	) : null;
};

export default GlobalLayout;

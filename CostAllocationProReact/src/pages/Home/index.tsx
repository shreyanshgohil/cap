import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkPermission } from 'utils/utils';

const Home = () => {
	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isViewDashboardPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Dashboard',
		permission: ['view'],
	});

	const navigate = useNavigate();

	useEffect(() => {
		document.title = 'CostAllocation Pro';
	}, []);

	useEffect(() => {
		if (!isViewDashboardPermission && selectedCompanyPermission) {
			navigate('/');
		}
	}, [isViewDashboardPermission]);

	return <>{!isViewDashboardPermission ? <> </> : <h1> Dashboard</h1>}</>;
};

export default Home;

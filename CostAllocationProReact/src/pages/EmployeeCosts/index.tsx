import { EmployeeCostMain } from 'components/EmployeeCost';
import { Loader } from 'components/Global';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { getEmployeeCostAction } from 'redux/action/employeeCostAction';
// import { AppDispatch } from 'redux/store';
// import { checkPermission } from 'utils/utils';
import './index.css';
import styles from './index.module.scss';

const EmployeeCosts = () => {
	// const dispatch = useDispatch<AppDispatch>();
	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);
	const { fistTimeFetchLoading } = useSelector(
		(state: any) => state?.employeeCosts
	);
	const payPeriodId = useSelector(
		(state: any) => state?.payPeriods?.createdPayPeriod?.id
	);
	// const navigate = useNavigate();

	// const initialFunction = () => {
	// 	console.log("Pay : ", payPeriodId);
	// 	dispatch(
	// 		getEmployeeCostAction({
	// 			payPeriodId,
	// 			page: 1,
	// 			limit: 10,
	// 		})
	// 	);
	// 	if (selectedCompanyPermission) {
	// 		const isViewEmployeeCostPermission = checkPermission(
	// 			selectedCompanyPermission,
	// 			{
	// 				permissionName: 'Employee Cost',
	// 				permission: ['view'],
	// 			}
	// 		);

	// 		if (!isViewEmployeeCostPermission) {
	// 			navigate('/unauthorized');
	// 		}
	// 	}
	// };

	useEffect(() => {
		// initialFunction();
	}, [selectedCompanyPermission, payPeriodId]);

	useEffect(() => {
		document.title = 'CostAllocation Pro - Employee Costs';
	}, []);

	return !fistTimeFetchLoading ? (
		<div className={styles['employee-container']}>
			<div className={styles['employee-container__title']}>Employee Costssss</div>
			<div className={styles['employee-container__table']}>
				<div className={styles['table-employee']}>
					<EmployeeCostMain />
				</div>
			</div>
		</div>
	) : (
		<Loader />
	);
};

export default EmployeeCosts;

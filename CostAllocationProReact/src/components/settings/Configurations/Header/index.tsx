import { SyncNow } from 'components/Global';
import styles from './index.module.scss';
import { useEffect, useState } from 'react';
import { refreshClass } from 'redux/action/classAction';
import { refreshOfAccountAction } from 'redux/action/chartOfAccountAction';
import { refreshAccountAction } from 'redux/action/customerAction';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { toastText } from 'utils/utils';

// Component for main configurations
const ConfigurationHeader = () => {
	// Init
	const dispatch = useDispatch<AppDispatch>();
	// for manage the sync now button

	const [lastSyncTime, setLastSyncTime] = useState(new Date());

	const configureLastSync = useSelector(
		(state: any) =>
			state?.companies?.selectedCompanyDetails?.company?.classLastSyncDate
	);

	useEffect(() => {
		setLastSyncTime(configureLastSync);
	}, [configureLastSync]);

	const [isLoading, setIsLoading] = useState(false);

	const syncNowHandler = () => {
		setIsLoading(true);
		dispatch(refreshClass());
		dispatch(refreshOfAccountAction());
		dispatch(refreshAccountAction()).then(() => {
			setIsLoading(false);
			toastText('Configurations synced successfully', 'success');
		});
		setLastSyncTime(new Date());
	};
	// JSX
	return (
		<div className={styles['configuration']}>
			<div className={styles['configuration__wrapper']}>
				<h3 className={styles['configuration__title']}>
					Mapping and General Settings
				</h3>
				<div className={styles['configuration__sync']}>
					<SyncNow
						isLastSyncNeeded={false}
						syncDate={lastSyncTime}
						isLoading={isLoading}
						handleSync={syncNowHandler}
						tooltip=""
						key={1}
						title="Refresh"
					/>
				</div>
			</div>
		</div>
	);
};

export default ConfigurationHeader;

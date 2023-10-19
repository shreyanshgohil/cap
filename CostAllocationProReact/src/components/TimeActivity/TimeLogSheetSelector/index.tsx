import { FC } from 'react';
import { useSelector } from 'react-redux';
import { AddSvg } from 'utils/svgs';
import { checkPermission } from 'utils/utils';
import styles from './index.module.scss';
import './index.scss';
import { TimeLogSheetSelectorProps } from './types';

const TimeLogSheetSelector: FC<TimeLogSheetSelectorProps> = (props) => {
	// Inits
	const {
		addTimeLogHandler,
		changeTimeLogSheet,
		isTimeLog,
		// hoursUnder,
		// filterUnderOverHandler,
	} = props;

	const selectedCompanyPermission = useSelector(
		(state: any) => state?.companies?.selectedCompanyDetails?.role?.permissions
	);

	const isAddTimeLogPermission = checkPermission(selectedCompanyPermission, {
		permissionName: 'Time Logs',
		permission: ['add'],
	});

	// JSX
	return (
		<div className={styles['log-sheet']}>
			<div className={styles['log-sheet__wrapper']}>
				<div
					className={`${styles['log-sheet__left']} ${
						isTimeLog ? styles['time_logs_after'] : styles['time_sheet_after']
					}`}
				>
					<button
						className={styles['log-sheet__left--btn-time-log']}
						onClick={() => {
							changeTimeLogSheet(true);
						}}
					>
						Time Logs
					</button>
					<button
						className={styles['log-sheet__left--btn-time-log']}
						onClick={() => {
							changeTimeLogSheet(false);
						}}
					>
						Time sheets
					</button>
				</div>
				{isTimeLog && (
					<div className={styles['log-sheet__right']}>
						{/* <div className={styles['log-sheet__right--hours-over']}>
							<Checkbox
								id="overHours"
								className={'check-box-black'}
								checked={hoursUnder}
								defaultChecked={hoursUnder}
								onChange={(event: any) =>
									filterUnderOverHandler(event.target.checked)
								}
							/>
							<label htmlFor="overHours">Hours Over</label>
						</div> */}
						{isAddTimeLogPermission && (
							<div className={styles['log-sheet__right--add-time-log']}>
								<button
									className={`btn-black ${styles['user-table__action--button']}`}
									onClick={addTimeLogHandler}
								>
									<AddSvg />
									<p>Add Time log</p>
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default TimeLogSheetSelector;

import React from 'react';
import styles from './index.module.scss';
import './index.scss';
import { EmployeeCostSelectorProps } from './types';

const EmployeeCostSelector = (props: EmployeeCostSelectorProps) => {
	const { isEmployeeCost, changeEmployeeCost } = props;

	return (
		<div className={styles['log-sheet']}>
			<div className={styles['log-sheet__wrapper']}>
				<div
					className={`${styles['log-sheet__left']} ${
						!isEmployeeCost
							? styles['time_logs_after']
							: styles['time_sheet_after']
					}`}
				>
					<button
						className={styles['log-sheet__left--btn-time-log']}
						onClick={() => {
							changeEmployeeCost(false);
						}}
					>
						Employee Costs
					</button>

					<button
						className={styles['log-sheet__left--btn-time-log']}
						onClick={() => {
							changeEmployeeCost(true);
						}}
					>
						Pay Period
					</button>
				</div>
			</div>
		</div>
	);
};

export default EmployeeCostSelector;

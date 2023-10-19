/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChangeEvent, useRef, useState } from 'react';
import DynamicTable from './Table';
import styles from './inedx.module.scss';

// Time sheet
const TimeSheet = () => {

	// JSX
	return (
		<div className={styles['time-sheet']}>
			<div className={styles['time-sheet__wrapper']}>
				<DynamicTable
				/>
			</div>
		</div>
	);
};

export default TimeSheet;

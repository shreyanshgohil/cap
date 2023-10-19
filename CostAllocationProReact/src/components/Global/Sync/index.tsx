import { Tooltip } from 'antd';
import { FC } from 'react';
import { SyncNowSvg } from 'utils/svgs';
import styles from './index.module.scss';
import { SyncProps } from './types';
import { TimeAgo } from 'utils/utils';
// Sync now button
const SyncNow: FC<SyncProps> = (props) => {
	// Inits
	const {
		syncDate,
		tooltip,
		handleSync,
		isLastSyncNeeded = true,
		isLoading,
		title = 'Sync Now',
	} = props;

	const newDate = TimeAgo(syncDate);

	// JSX
	return (
		<Tooltip title={tooltip} className={styles['sync-now']}>
			<div className={styles['sync-now__wrapper']}>
				<div
					className={`${styles['sync-now__text']} ${
						isLastSyncNeeded && styles['sync-now__mb']
					}} ${isLoading && 'pointer-event-none'}`}
					onClick={handleSync}
				>
					{isLoading ? (
						<img
							src="assets/gifs/sync-loader.gif"
							className="sync-loader-gif"
						/>
					) : (
						<SyncNowSvg />
					)}
					<p>{title}</p>
				</div>
				<div className={styles['sync-now__last-sync']}>
					{isLastSyncNeeded && <p>{newDate}</p>}
				</div>
			</div>
		</Tooltip>
	);
};

export default SyncNow;

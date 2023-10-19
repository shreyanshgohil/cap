import { Sidebar } from 'components/Global';

import { FC } from 'react';
import styles from './index.module.scss';
import { SettingsLayoutProps } from './types';
// Settings page layout
const SettingsLayout: FC<SettingsLayoutProps> = (props) => {
	// inits

	const { children, onSideBarChange, selectedSidebar, filteredMenuItems } =
		props;

	// JSX
	return (
		<div className={styles['settings-layout']}>
			<div className={styles['settings-layout__wrapper']}>
				<Sidebar
					items={filteredMenuItems}
					isGetSupportButton={true}
					handleSidebar={onSideBarChange}
					selectedSidebar={selectedSidebar as string}
				/>
				<div className={styles['settings-layout__body']}>{children}</div>
			</div>
		</div>
	);
};

export default SettingsLayout;

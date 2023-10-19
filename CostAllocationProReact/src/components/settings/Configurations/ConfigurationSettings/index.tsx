import { FC } from 'react';
import CapQbLogo from '../CapQbLogo';
import styles from './index.module.scss';
import { ConfigurationSettingsProps } from './types';
import MappingBox from '../MappingBox';

// For whole mapping section
const ConfigurationSettings: FC<ConfigurationSettingsProps> = (props) => {
	const {
		settingsData,
		children,
		qbSelectionObj,
		settingsChangeHandler,
		isFirstTimeSubmit,
		deleteFieldHandler,
		addFieldHandler,
		showModal,
	} = props;
	return (
		<div className={styles['configuration-settings']}>
			<div className={styles['configuration-settings__wrapper']}>
				<div className={styles['configuration-settings--logos']}>
					<CapQbLogo />
				</div>
				<div className={styles['configuration-settings__settings']}>
					{Object.values(settingsData).map(
						(singleMappingSection: any, index: number) => {
							return (
								<MappingBox
									key={index}
									allMappingSection={settingsData}
									singleMappingSection={singleMappingSection}
									qbSelectionObj={qbSelectionObj}
									settingsChangeHandler={settingsChangeHandler}
									isFirstTimeSubmit={isFirstTimeSubmit}
									deleteFieldHandler={deleteFieldHandler}
									addFieldHandler={addFieldHandler}
									showModal={showModal}
								/>
							);
						}
					)}
					{children}
				</div>
			</div>
		</div>
	);
};

export default ConfigurationSettings;

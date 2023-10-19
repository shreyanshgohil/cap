import { SettingsChangeHandler } from '../MappingBox/types';

export interface ConfigurationSettingsProps {
	settingsData: any;
	qbSelectionObj: any;
	children?: any;
	settingsChangeHandler: (SettingsChangeHandler: SettingsChangeHandler) => void;
	isFirstTimeSubmit: boolean;
	deleteFieldHandler: (sectionMappingId: string, fieldId: string) => void;
	addFieldHandler: (sectionMappingId: string) => void;
	showModal: any;
}

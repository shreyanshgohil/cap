export interface SettingsChangeHandler {
	sectionId: string;
	fieldId: string;
	fieldName: string;
	dataId: any;
}

export interface SingleMappingSection {
	singleMappingSection: any;
	qbSelectionObj: any;
	settingsChangeHandler: (SettingsChangeHandler: SettingsChangeHandler) => void;
	isFirstTimeSubmit: boolean;
	allMappingSection: any;
	deleteFieldHandler: (sectionMappingId: string, fieldId: string) => void;
	addFieldHandler: (sectionMappingId: string) => void;
	showModal: any;
	// changeFirstTimeSubmit: any;
}

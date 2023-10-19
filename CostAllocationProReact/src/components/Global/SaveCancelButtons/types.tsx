export interface SaveCancelButtonsProps {
	saveHandler: () => void;
	cancelHandler: () => void;
	loadingForSave: boolean;
	loadingForCancel?: boolean;
	saveTitle: string;
	cancelTitle: string;
}

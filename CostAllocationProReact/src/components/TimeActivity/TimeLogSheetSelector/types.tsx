export interface TimeLogSheetSelectorProps {
	addTimeLogHandler: () => void;
	changeTimeLogSheet: (isTimeLog: boolean) => void;
	isTimeLog: boolean;
	// hoursUnder: boolean;
	// filterUnderOverHandler: (value: boolean) => void;
}

export interface TimeLog {
	id: string;
	timeActivityId: string;
	classId: string | null;
	className: string | null;
	customerId: string;
	customerName: string;
	hours: string;
	minute: string;
	companyId: string;
	employeeId: string;
	activityDate: string;
	employee: any;
	SplitTimeActivities: any;
	isOver: boolean;
	overHours: number;
	overMinutes: number;
}

export interface TimeLogsProps {
	openTables: any;
	setOpenTables: any;
	timeLogs: TimeLog[];
	// hoursUnder: boolean;
	updateTimeLogHandler: (id: string, key: string, value: string) => void;
	saveAddedItemHandler: (id: string) => void;
	updateSavedTimeLog: (id: string, hours: string) => void;
	deleteTimeLogHandler: (timeLog: any) => void;
	splitTimeLogHandler: (timeLogData: any) => void;
	cancelSplitHandler: (timeLogData: any) => void;
	saveSplitTimeLogHandler: (timeLogData: any) => void;
	disableHandler: any;
	subSplitHandler: (
		splitTimeActivity: any,
		timeLog: any,
		index: number
	) => void;
	removeSubSplitHandler: (
		splitTimeActivity: any,
		timeLog: any,
		index: number
	) => void;
	updateSplitActivityHandler: (
		id: string,
		key: string,
		value: string,
		index: number
	) => void;
	updateSplitActivityOnBlur: (
		id: string,
		key: string,
		value: string,
		index: number
	) => any;
	error: any;
	onChangePayPeriod: (payPeriod: any) => void
}

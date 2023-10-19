import { TimeSheetsStatus } from '../enum';

export interface TimeSheetInterface {
	name: string;
	notes?: string;
	status: TimeSheetsStatus;
	companyId: string;
	payPeriodId?: string;
	userId?: string;
	submittedOn?: Date;
	totalHours?: string;
	totalMinute?: string;
	startDate?: Date;
	endDate?: Date;
	timeActivities?: any;
	approvedHours?: string;
}

export interface GetTimeSheetInterface {
	companyId: string;
	payPeriodId?: string;
	page?: number;
	limit?: number;
	search?: string;
	offset?: number;
	createdBy?: string;
	type?: string;
	sort?: string;
	sortCondition?: any;
	filterConditions?: any;
	searchCondition?: any;
	payPeriodFilter?: any;
}

export interface TimeSheetLogsInterface {
	hours: string;
	minute: string;
	employeeId: string;
	timeSheetsId: string;
}

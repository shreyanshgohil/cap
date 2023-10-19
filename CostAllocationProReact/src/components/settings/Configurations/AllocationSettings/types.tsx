import { SettingsChangeHandler } from '../MappingBox/types';

export interface AllocationSettingsProps {
	settingsData: any;
	changePayrollMethodHandler: (payrollMethod: string) => void;
	payrollMethod: string;
	indirectExpenseRate: number;
	changeExpenseRateAllocationHandler: (e: any) => void;
	settingsChangeHandler: (SettingsChangeHandler: SettingsChangeHandler) => void;
}

import { configureStore } from '@reduxjs/toolkit';
import chartOfAccountSlice from './slice/chartOfAccountSlice';
import classSlice from './slice/classSlice';
import companySlice from './slice/companySlice';
import configurationFieldSlice from './slice/configurationFieldSlice';
import customerSlice from './slice/customerSlice';
import employeeSlice from './slice/employeeSlice';
import loginSlice from './slice/loginSlice';
import permissionsSlice from './slice/permissionSlice';
import profileSlice from './slice/profileSlice';
import roleSlice from './slice/roleSlice';
import RoleTableSlice from './slice/roleTableSlice';
import selectedCompanyConfigurationSlice from './slice/selectedCompanyConfigurations';
import selectedCompanyPermissionsSlice from './slice/selectedCompanyPermissions';
import selectedCompanyRoleSlice from './slice/selectedCompanyRoleSlice';
import selectedCompanySlice from './slice/selectedCompanySlice';
import timeLogsSlice from './slice/timeLogSlice';
import userSlice from './slice/userSlice';
import employeeCostSlice from './slice/employeeCostSlice';
import employeeCostCoumnSlice from './slice/employeeCostColumnSlice';
import payPeriodSlice from './slice/payPeriodSlice';
import timeSheetSlice from './slice/timeSheetSlice';

const store = configureStore({
	reducer: {
		auth: loginSlice.reducer,
		userProfile: profileSlice.reducer,
		companies: companySlice.reducer,
		users: userSlice.reducer,
		roles: roleSlice.reducer,
		permissions: permissionsSlice.reducer,
		roleTable: RoleTableSlice.reducer,
		class: classSlice.reducer,
		chartOfAccounts: chartOfAccountSlice.reducer,
		customer: customerSlice.reducer,
		employees: employeeSlice.reducer,
		selectedCompany: selectedCompanySlice.reducer,
		selectedCompanyRole: selectedCompanyRoleSlice.reducer,
		selectedCompanyPermissions: selectedCompanyPermissionsSlice.reducer,
		selectedCompanyConfigurations: selectedCompanyConfigurationSlice.reducer,
		timeLogs: timeLogsSlice.reducer,
		configurationFields: configurationFieldSlice.reducer,
		employeeCosts: employeeCostSlice.reducer,
		employeeCostColumns: employeeCostCoumnSlice.reducer,
		payPeriods: payPeriodSlice.reducer,
		timeSheets: timeSheetSlice.reducer
	},
});

export default store;
export type AppDispatch = typeof store.dispatch;

import { createSlice } from '@reduxjs/toolkit';
import { updateConfiguration } from 'redux/action/configurationAction';
import { toastText } from 'utils/utils';

const initialState: any = {
	data: null,
	selectedCompanyDetails: null,
	configurations: null,
	isLoading: false,
	updateConfigurationLoader: false,
	error: null,
};

const CompanySlice = createSlice({
	name: 'company',
	initialState,
	reducers: {
		getCompanies: (state, data) => {
			const companies = data?.payload?.data?.companies;
			const companyId = localStorage.getItem('companyId');

			if (!companyId) {
				if (companies?.length > 0) {
					localStorage.setItem('companyId', companies[0]?.company?.id);
					localStorage.setItem(
						'companyName',
						companies[0]?.company?.tenantName
					);
				}
			}
			state.data = companies;
			const companyData = companies?.find(
				(singleCompany: any) =>
					singleCompany?.company?.id === localStorage.getItem('companyId')
			);
			state.selectedCompanyDetails = companyData;
			state.configurations = companyData?.company?.configuration;
		},
		getCompanyDetails: (state, data) => {
			const companyDetails = state?.data?.filter(
				(company: any) => company?.companyId === data?.payload
			);
			state.selectedCompanyDetails = companyDetails[0];
			state.configurations = companyDetails[0]?.company?.configuration;
		},

		updateCompanyStatus: (state, data) => {
			const companyDetails = state?.data?.find(
				(company: any) => company?.companyId == data?.payload?.data?.key
			);

			const companyUpdatedDetails = {
				...companyDetails,
				company: {
					...companyDetails?.company,
					status: data?.payload?.value,
				},
			};

			state.selectedCompanyDetails = companyUpdatedDetails;

			state.data = state?.data?.map((company: any) => {
				if (company?.companyId == data?.payload?.data?.key) {
					return companyUpdatedDetails;
				} else {
					return company;
				}
			});
		},

		updateCompanyConnect: (state, data) => {
			const companyDetails = state?.data?.find(
				(company: any) => company?.companyId == data?.payload?.companyId
			);

			const companyUpdatedDetails = {
				...companyDetails,
				company: {
					...companyDetails?.company,
					isConnected: data?.payload?.value,
				},
			};

			state.selectedCompanyDetails = companyUpdatedDetails;

			state.data = state?.data?.map((company: any) => {
				if (company?.companyId == data?.payload?.companyId) {
					return companyUpdatedDetails;
				} else {
					return company;
				}
			});
		},

		timeActivitySyncDate: (state) => {
			state.selectedCompanyDetails.company.timeActivitiesLastSyncDate =
				new Date();
		},

		employeeCostSyncDate: (state) => {
			state.selectedCompanyDetails.company.employeeLastSyncDate = new Date();
		},
	},
	extraReducers: (builder) => {
		builder.addCase(updateConfiguration.pending, (state) => {
			state.updateConfigurationLoader = true;
		});
		builder.addCase(updateConfiguration.fulfilled, (state, action) => {
			state.updateConfigurationLoader = false;
			state.configurations = action.payload.data;
			toastText(action.payload.message, 'success');
		});
		builder.addCase(updateConfiguration.rejected, (state, action: any) => {
			state.updateConfigurationLoader = false;
			toastText(action.payload.message, 'error');
		});
	},
});

export const {
	getCompanies,
	getCompanyDetails,
	updateCompanyStatus,
	updateCompanyConnect,
	timeActivitySyncDate,
	employeeCostSyncDate,
} = CompanySlice.actions;
export default CompanySlice;

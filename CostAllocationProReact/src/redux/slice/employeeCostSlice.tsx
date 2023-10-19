import { createSlice } from '@reduxjs/toolkit';
import {
	getEmployeeCostAction,
	paginateEmployeeCostAction,
	updateEmployeeCost,
} from 'redux/action/employeeCostAction';

const initialState: any = {
	isLoading: false,
	count: 0,
	data: [],
	calculatedData: [],
	payPeriodId: null,
	fistTimeFetchLoading: false,
	// selectedMonth: new Date(),
	error: null,
};

const employeeCostSlice = createSlice({
	initialState,
	name: 'employee',
	reducers: {
		changeSelectedMonth: (state, action) => {
			state.selectedMonth = action.payload;
		},
		clearEmployeeCostRedux: () => {
			return initialState;
		},
		updateEmployeeCostValue: (state, action) => {
			const copy = [...state.calculatedData];
			copy[action.payload.index][action.payload.key] = action.payload.value;
			state.calculatedData = copy;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(getEmployeeCostAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(getEmployeeCostAction.fulfilled, (state, action) => {
			state.data = action.payload?.employees;
			state.calculatedData = action.payload?.employees;
			state.count = action?.payload?.count;
			state.payPeriodId = action?.payload?.payPeriodId;
			state.isLoading = false;
			state.fistTimeFetchLoading = false;
			state.error = null;
		});
		builder.addCase(getEmployeeCostAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.payPeriodId = null;
			state.error = action.error;
			state.fistTimeFetchLoading = false;
			state.data = [];
			state.calculatedData = [];
			state.count = 0;
		});
		//Paginate Users
		builder.addCase(paginateEmployeeCostAction.pending, (state) => {
			state.isLoading = false;
		});
		builder.addCase(paginateEmployeeCostAction.fulfilled, (state, action) => {
			state.data = action?.payload;
			state.calculatedData = action?.payload;
			state.isLoading = false;
		});
		builder.addCase(paginateEmployeeCostAction.rejected, (state, action: any) => {
			state.data = [];
			state.calculatedData = [];
			state.error = action.error;
			state.isLoading = false;
			state.count = 0;
		});
		// For update it
		builder.addCase(updateEmployeeCost.fulfilled, (state, action) => {
			state.data = action?.payload;
			state.isLoading = false;
		});
	},
});

export default employeeCostSlice;
export const { changeSelectedMonth, clearEmployeeCostRedux, updateEmployeeCostValue } = employeeCostSlice.actions;

import { createSlice } from '@reduxjs/toolkit';
import {
	getEmployeeAction,
	paginateGetEmployeeAction,
} from 'redux/action/employeeAction';

const initialState = {
	isLoading: false,
	data: [],
	error: null,
};

const employeeSlice = createSlice({
	initialState,
	name: 'employee',
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getEmployeeAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(getEmployeeAction.fulfilled, (state, action) => {
			state.data = action.payload;
			state.isLoading = false;
		});
		// Paginate employees
		builder.addCase(paginateGetEmployeeAction.fulfilled, (state, action) => {
			state.data = action?.payload;
			state.isLoading = false;
		});
		builder.addCase(getEmployeeAction.rejected, (state, action: any) => {
			state.error = action.error;
			state.isLoading = false;
		});
	},
});

export default employeeSlice;

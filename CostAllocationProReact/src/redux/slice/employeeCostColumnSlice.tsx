import { createSlice } from '@reduxjs/toolkit';
import { getEmployeeCostColumnAction } from 'redux/action/employeeCostColumnSlice';

const initialState = {
	isLoading: false,
	data: [],
	error: null,
};

const employeeCostCoumnSlice = createSlice({
	initialState,
	name: 'employee',
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getEmployeeCostColumnAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(getEmployeeCostColumnAction.fulfilled, (state, action) => {
			state.data = action.payload;
			state.isLoading = false;
		});
		builder.addCase(
			getEmployeeCostColumnAction.rejected,
			(state, action: any) => {
				state.error = action.error;
				state.isLoading = false;
			}
		);
	},
});

export default employeeCostCoumnSlice;

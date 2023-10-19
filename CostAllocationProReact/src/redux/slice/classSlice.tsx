import { createSlice } from '@reduxjs/toolkit';
import { classAction, refreshClass } from 'redux/action/classAction';
const initialState = {
	isLoading: false,
	data: [],
	error: null,
};

const classSlice = createSlice({
	initialState,
	name: 'class',
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(classAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(classAction.fulfilled, (state, action) => {
			state.data = action.payload;
			state.isLoading = false;
		});
		builder.addCase(classAction.rejected, (state, action: any) => {
			state.error = action.payload;
			state.isLoading = false;
		});
		builder.addCase(refreshClass.fulfilled, (state, action) => {
			state.data = action.payload;
		});
	},
});

export default classSlice;

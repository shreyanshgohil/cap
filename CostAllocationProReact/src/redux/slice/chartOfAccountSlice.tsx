import { createSlice } from '@reduxjs/toolkit';
import {
	chartOfAccountAction,
	refreshOfAccountAction,
} from 'redux/action/chartOfAccountAction';

const initialState = {
	isLoading: false,
	data: null,
	error: null,
};

const chartOfAccountSlice = createSlice({
	initialState,
	name: 'chartOfAccount',
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(chartOfAccountAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(chartOfAccountAction.fulfilled, (state, action) => {
			state.data = action.payload;
			state.isLoading = false;
		});
		builder.addCase(chartOfAccountAction.rejected, (state, action: any) => {
			state.error = action.error;
			state.isLoading = false;
		});
		builder.addCase(refreshOfAccountAction.fulfilled, (state, action) => {
			state.data = action.payload;
		});
	},
});

export default chartOfAccountSlice;

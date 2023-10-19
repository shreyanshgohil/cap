import { createSlice } from '@reduxjs/toolkit';
import {
	editPeriodAction,
	getPeriodDatesAction,
	paginateAction,
	payPeriodAction,
	payPeriodOptionsAction,
	savePayPeriod,
} from 'redux/action/payPeriodAction';

const initialState: any = {
	isLoading: false,
	editLoader: false,
	data: [],
	error: null,
	count: 0,
	payPeriodDates: [],
	createdPayPeriod: null,
	createdPayPeriodError: null,
	createdPayPeriodLoading: false,
	optionData: [],
	isOptionLoading: false,
	isOptionError: false,
};

const payPeriodSlice = createSlice({
	initialState,
	name: 'payPeriodSlice',
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(payPeriodAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(payPeriodAction.fulfilled, (state, action) => {
			state.data = action.payload.data;
			state.count = action.payload.total;
			state.isLoading = false;
		});
		builder.addCase(paginateAction.fulfilled, (state, action) => {
			state.data = [...state.data, ...action.payload.data];
		});
		builder.addCase(payPeriodAction.rejected, (state, action: any) => {
			state.error = action.payload;
			state.isLoading = false;
		});
		builder.addCase(editPeriodAction.pending, (state) => {
			state.editLoader = true;
		});
		builder.addCase(editPeriodAction.fulfilled, (state) => {
			state.editLoader = false;
		});
		builder.addCase(editPeriodAction.rejected, (state, action: any) => {
			state.error = action.payload;
			state.editLoader = false;
		});
		builder.addCase(getPeriodDatesAction.fulfilled, (state, action) => {
			state.payPeriodDates = action.payload;
		});
		builder.addCase(payPeriodOptionsAction.pending, (state) => {
			state.isOptionLoading = true;
		});
		builder.addCase(payPeriodOptionsAction.fulfilled, (state, action) => {
			state.optionData = action.payload;
			state.isOptionLoading = false;
		});
		builder.addCase(payPeriodOptionsAction.rejected, (state, action: any) => {
			state.isOptionError = action.payload;
			state.isOptionLoading = false;
		});

		//create reducers
		builder.addCase(savePayPeriod.pending, (state) => {
			state.createdPayPeriodLoading = true;
		});
		builder.addCase(savePayPeriod.fulfilled, (state, action) => {
			state.createdPayPeriod = action.payload;
			state.createdPayPeriodLoading = false;
			state.createdPayPeriodError = null;
		});
		builder.addCase(savePayPeriod.rejected, (state, action: any) => {
			state.createdPayPeriodError = action.payload;
			state.createdPayPeriodLoading = false;
			state.createdPayPeriod = null;
		});
	},
});

export default payPeriodSlice;

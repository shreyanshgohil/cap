import { createSlice } from '@reduxjs/toolkit';
import { customerAccountAction } from 'redux/action/customerAction';

const initialState = {
	isLoading: false,
	data: [],
	error: null,
};

const customerSlice = createSlice({
	initialState,
	name: 'customer',
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(customerAccountAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(customerAccountAction.fulfilled, (state, action) => {
			state.data = action.payload;
			state.isLoading = false;
		});
		builder.addCase(customerAccountAction.rejected, (state, action: any) => {
			state.error = action.error;
			state.isLoading = false;
		});
	},
});

export default customerSlice;

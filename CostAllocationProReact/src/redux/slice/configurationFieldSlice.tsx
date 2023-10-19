import { createSlice } from '@reduxjs/toolkit';
import { getConfigurationFieldAction } from 'redux/action/configurationFieldAction';

const initialState = {
	isLoading: false,
	data: [],
	error: null,
};

const configurationFieldSlice = createSlice({
	initialState,
	name: 'configurationFields',
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getConfigurationFieldAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(getConfigurationFieldAction.fulfilled, (state, action) => {
			state.data = action.payload;
			state.isLoading = false;
		});
		builder.addCase(
			getConfigurationFieldAction.rejected,
			(state, action: any) => {
				state.error = action.error;
				state.isLoading = false;
			}
		);
	},
});

export default configurationFieldSlice;

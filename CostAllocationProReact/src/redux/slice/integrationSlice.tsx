import { createSlice } from '@reduxjs/toolkit';
import { disconnectAction } from 'redux/action/integrationAction';
import { toastText } from 'utils/utils';

// import { toastText } from 'utils/utils';

const initialState: any = {
	data: null,
	isLoading: false,
	error: null,
};

const IntegrationSlice = createSlice({
	name: 'integration',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(disconnectAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(disconnectAction.fulfilled, (state, action: any) => {
			state.isLoading = false;
			localStorage.setItem('accessToken', action?.payload?.data?.accessToken);
			localStorage.setItem('refreshToken', action?.payload?.data?.refreshToken);
			toastText(action?.payload?.message, 'success');
		});
		builder.addCase(disconnectAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
		});
	},
});

export default IntegrationSlice;

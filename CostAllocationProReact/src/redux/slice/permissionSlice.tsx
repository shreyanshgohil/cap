import { createSlice } from '@reduxjs/toolkit';
import {
	getPermissionsAction,
	updatePermissionsAction,
} from 'redux/action/permissionAction';
import { toastText } from 'utils/utils';

const initialState: any = {
	isLoading: false,
	updateLoader: false,
	data: [],
	error: null,
};

const permissionsSlice = createSlice({
	initialState,
	name: 'Permission',
	reducers: {
		updatePermissionHandler: (state, action) => {
			state.data = action.payload;
		},
	},
	extraReducers: (builder) => {
		// For get the permissions
		builder.addCase(getPermissionsAction.pending, (state) => {
			state.isLoading = true;
		});
		builder.addCase(getPermissionsAction.fulfilled, (state, action) => {
			state.data = action.payload;
			state.isLoading = false;
		});
		builder.addCase(getPermissionsAction.rejected, (state) => {
			state.isLoading = false;
		});

		// For update the permissions
		builder.addCase(updatePermissionsAction.pending, (state) => {
			state.updateLoader = true;
		});
		builder.addCase(updatePermissionsAction.fulfilled, (state, action) => {
			state.data = action.payload.permissions;
			state.updateLoader = false;
			toastText(action?.payload?.response?.data?.message, 'success');
		});
		builder.addCase(updatePermissionsAction.rejected, (state, action: any) => {
			state.updateLoader = false;
			toastText(action.payload.message, 'error');
		});
	},
});

export default permissionsSlice;

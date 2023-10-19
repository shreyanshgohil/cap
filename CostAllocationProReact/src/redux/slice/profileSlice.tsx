import { createSlice } from '@reduxjs/toolkit';
import {
	deleteProfileImageAction,
	fetchProfileAction,
	updateProfileAction,
	uploadProfileImageAction,
} from 'redux/action/profileAction';
import { toastText } from 'utils/utils';

const initialState: any = {
	data: null,
	isLoading: true,
	updateLoader: false,
	error: null,
};

const ProfileSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		// Fetch Profile
		builder.addCase(fetchProfileAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchProfileAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.data = action?.payload?.data;
		});
		builder.addCase(fetchProfileAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
		});

		// Update Profile
		builder.addCase(updateProfileAction.pending, (state) => {
			state.updateLoader = true;
			state.error = null;
		});
		builder.addCase(updateProfileAction.fulfilled, (state, action) => {
			state.updateLoader = false;
			state.data = action?.payload?.data;
			toastText(action?.payload?.message, 'success');
		});
		builder.addCase(updateProfileAction.rejected, (state, action: any) => {
			state.updateLoader = false;
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
		});
		// Delete the profile image
		builder.addCase(deleteProfileImageAction.fulfilled, (state: any) => {
			state.data.profileImg = null;
		});
		// Upload the profile image
		builder.addCase(uploadProfileImageAction.fulfilled, (state, action) => {
			state.data = action?.payload?.data;
		});
	},
});

export default ProfileSlice;

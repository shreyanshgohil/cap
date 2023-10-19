import { createSlice } from '@reduxjs/toolkit';
import {
	deleteUserAction,
	editUserAction,
	getUsersAction,
	inviteUserAction,
	paginateUserAction,
} from 'redux/action/userAction';
import { toastText } from 'utils/utils';
// import { toastText } from 'utils/utils';

const initialState: any = {
	data: null,
	count: 0,
	isLoading: true,
	fistTimeFetchLoading: true,
	error: null,
};

const UserSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		updateLoadingHandler: (state) => {
			state.isLoading = false;
		},
		clearRedux: () => {
			return {
				...initialState,
			};
		},
	},
	extraReducers: (builder) => {
		// Get All Users
		builder.addCase(getUsersAction.pending, (state) => {
			// state.fistTimeFetchLoading = true;
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(getUsersAction.fulfilled, (state, action) => {
			state.data = action?.payload?.data;
			state.count = action?.payload?.total;
			state.isLoading = false;
			state.fistTimeFetchLoading = false;
		});
		builder.addCase(getUsersAction.rejected, (state, action: any) => {
			state.error = action.payload;
			state.isLoading = false;
			state.fistTimeFetchLoading = false;
		});

		//Paginate Users
		builder.addCase(paginateUserAction.fulfilled, (state, action) => {
			state.data = action?.payload;
			state.isLoading = false;
		});

		// Invite New User
		builder.addCase(inviteUserAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(inviteUserAction.fulfilled, (state, action) => {
			state.data = [...state.data, action.payload.data];
			toastText(action?.payload?.message, 'success');
			state.isLoading = false;
		});
		builder.addCase(inviteUserAction.rejected, (state, action: any) => {
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
			state.isLoading = false;
		});

		// Edit User
		builder.addCase(editUserAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(editUserAction.fulfilled, (state, action) => {
			const updatedData = action.payload.editData;
			state.data = state.data.map((user: any) => {
				if (user?.userId === updatedData.userId) {
					return action.payload.response?.data;
				} else {
					return user;
				}
			});
			state.isLoading = false;

			toastText(action?.payload?.response?.message, 'success');
		});
		builder.addCase(editUserAction.rejected, (state, action: any) => {
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
			state.isLoading = false;
		});

		// Delete User
		builder.addCase(deleteUserAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(deleteUserAction.fulfilled, (state, action) => {
			state.data = state?.data?.filter(
				(item: any) => item?.id !== action?.payload?.id
			);
			state.isLoading = false;
			toastText(action?.payload?.response?.message, 'success');
		});
		builder.addCase(deleteUserAction.rejected, (state, action: any) => {
			state.error = action.payload;
			state.isLoading = false;
			toastText(action?.payload?.message, 'error');
		});
	},
});

export default UserSlice;
export const { updateLoadingHandler, clearRedux } = UserSlice.actions;

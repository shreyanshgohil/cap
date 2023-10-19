import { createSlice } from '@reduxjs/toolkit';
import {
	addRoleAction,
	deleteRoleAction,
	getRoleAction,
	editRoleAction,
	paginateRole,
} from 'redux/action/roleActions';
import { toastText } from 'utils/utils';

const initialState: any = {
	data: null,
	total: 0,
	isLoading: false,
	count: 0,
	error: null,
	fistTimeFetchLoading: true,
};

const RoleSlice = createSlice({
	name: 'role',
	initialState,
	reducers: {
		clearRedux: () => {
			return {
				...initialState,
			};
		},
	},
	extraReducers: (builder) => {
		// Get All Roles
		builder.addCase(getRoleAction.pending, (state) => {
			state.fistTimeFetchLoading = true;
			state.error = null;
		});
		builder.addCase(getRoleAction.fulfilled, (state, action) => {
			state.data = action?.payload.roles;
			state.count = action?.payload?.total;
			state.fistTimeFetchLoading = false;
		});
		builder.addCase(getRoleAction.rejected, (state, action: any) => {
			state.error = action.payload;
			state.fistTimeFetchLoading = false;
		});

		//paginate role
		builder.addCase(paginateRole.fulfilled, (state, action) => {
			state.isLoading = false;
			state.data = action?.payload;
		});

		// Add New Role
		builder.addCase(addRoleAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(addRoleAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.data = [...state.data, action.payload.data];
			toastText(action?.payload?.message, 'success');
		});
		builder.addCase(addRoleAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
		});

		// Edit Role
		builder.addCase(editRoleAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(editRoleAction.fulfilled, (state, action) => {
			state.isLoading = false;
			const updatedData = action.payload.editData;

			state.data = state.data.map((role: any) => {
				if (role?.id === updatedData.roleId) {
					return {
						...role,
						roleName: updatedData?.roleName || role?.roleName,
						roleDescription:
							updatedData?.roleDescription || role?.roleDescription,
						state: updatedData?.status || role?.status,
					};
				}
				return role;
			});

			toastText(action?.payload?.response?.message, 'success');
		});
		builder.addCase(editRoleAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
			toastText(action?.payload?.response?.message, 'error');
		});

		// Delete Role
		builder.addCase(deleteRoleAction.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(deleteRoleAction.fulfilled, (state, action) => {
			state.isLoading = false;
			state.data = state?.data?.filter(
				(item: any) => item?.id !== action?.payload?.id
			);
			toastText(action?.payload?.response?.message, 'success');
		});
		builder.addCase(deleteRoleAction.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload?.response;
			toastText(action?.payload.message, 'error');
		});
	},
});

export default RoleSlice;
export const { clearRedux } = RoleSlice.actions;

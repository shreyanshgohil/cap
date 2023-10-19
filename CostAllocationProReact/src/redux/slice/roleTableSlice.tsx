import { createSlice } from '@reduxjs/toolkit';
import {
	addRoleActionTable,
	deleteRoleActionTable,
	editRoleActionTable,
	getRoleActionTable,
	paginateRoleTable,
} from 'redux/action/roleTableAction';
import { toastText } from 'utils/utils';

const initialState: any = {
	data: null,
	fistTimeFetchLoading: true,
	total: 0,
	isLoading: false,
	count: 0,
	error: null,
};

const RoleTableSlice = createSlice({
	name: 'roleTable',
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
		builder.addCase(getRoleActionTable.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(getRoleActionTable.fulfilled, (state, action) => {
			state.data = action?.payload.roles;
			state.count = action?.payload?.total;
			state.isLoading = false;
			state.fistTimeFetchLoading = false;
		});
		builder.addCase(getRoleActionTable.rejected, (state, action: any) => {
			state.error = action.payload;
			state.isLoading = false;
			state.fistTimeFetchLoading = false;
		});

		//paginate role
		builder.addCase(paginateRoleTable.fulfilled, (state, action) => {
			state.isLoading = false;
			state.data = action?.payload;
		});

		// Add New Role
		builder.addCase(addRoleActionTable.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(addRoleActionTable.fulfilled, (state, action) => {
			state.isLoading = false;
			state.data = [...state.data, action.payload.data];
			toastText(action?.payload?.message, 'success');
		});
		builder.addCase(addRoleActionTable.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
		});

		// Edit Role
		builder.addCase(editRoleActionTable.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(editRoleActionTable.fulfilled, (state, action) => {
			state.isLoading = false;
			const updatedData = action.payload.editData;

			state.data = state.data.map((role: any) => {
				if (role?.id === updatedData.roleId) {
					return {
						...role,
						roleName: updatedData?.roleName || role?.roleName,
						roleDescription:
							updatedData?.roleDescription || role?.roleDescription,
						status: updatedData?.status ?? role?.status,
					};
				}
				return role;
			});

			toastText(action?.payload?.response?.message, 'success');
		});
		builder.addCase(editRoleActionTable.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload;
			toastText(action?.payload?.message, 'error');
		});

		// Delete Role
		builder.addCase(deleteRoleActionTable.pending, (state) => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(deleteRoleActionTable.fulfilled, (state, action) => {
			state.isLoading = false;
			state.data = state?.data?.filter(
				(item: any) => item?.id !== action?.payload?.id
			);
			toastText(action?.payload?.response?.message, 'success');
		});
		builder.addCase(deleteRoleActionTable.rejected, (state, action: any) => {
			state.isLoading = false;
			state.error = action.payload?.response;
			toastText(action?.payload.message, 'error');
		});
	},
});

export default RoleTableSlice;
export const { clearRedux } = RoleTableSlice.actions;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	data: null,
};

const selectedCompanyPermissionsSlice = createSlice({
	initialState: initialState,
	name: 'selectedCompanyPermissions',
	reducers: {
		setSelectedCompanyPermissions: (state, action) => {
			state.data = action.payload;
		},
	},
});

export const { setSelectedCompanyPermissions } =
	selectedCompanyPermissionsSlice.actions;
export default selectedCompanyPermissionsSlice;

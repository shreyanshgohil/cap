import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	data: null,
};

const selectedCompanyRoleSlice = createSlice({
	initialState: initialState,
	name: 'selectedCompanyRole',
	reducers: {
		setSelectedCompanyRole: (state, action) => {
			state.data = action.payload;
		},
	},
});

export const { setSelectedCompanyRole } = selectedCompanyRoleSlice.actions;
export default selectedCompanyRoleSlice;

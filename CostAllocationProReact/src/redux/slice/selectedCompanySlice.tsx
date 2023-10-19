import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	data: null,
};

const selectedCompanySlice = createSlice({
	initialState: initialState,
	name: 'selectedCompany',
	reducers: {
		setSelectedCompany: (state, action) => {
			state.data = action.payload;
		},
	},
});

export const { setSelectedCompany } = selectedCompanySlice.actions;
export default selectedCompanySlice;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	data: null,
};

const selectedCompanyConfigurationSlice = createSlice({
	initialState: initialState,
	name: 'selectedCompanyConfiguration',
	reducers: {
		setSelectedCompanyConfiguration: (state, action) => {
			state.data = action.payload;
		},
	},
});

export const { setSelectedCompanyConfiguration } =
	selectedCompanyConfigurationSlice.actions;
export default selectedCompanyConfigurationSlice;

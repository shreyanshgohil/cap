import { FC, useEffect, useState } from 'react';
import Configurations from '../Configurations';
import Integrations from '../Integrations';
import RoleTable from '../Role';
import UsersTable from '../User';
import { SettingsBodyProps } from './types';
import { useNavigate } from 'react-router-dom';

// Settings body
const SettingsBody: FC<SettingsBodyProps> = (props) => {
	// inits
	const {
		selectedSidebar,
		closeDrawerByAnimation,
		setSelectedSidebar,
		openDrawerHandler,
	} = props;

	// const settingsItem = localStorage.getItem('settings');

	const [settingsItem, setSettingsItem] = useState(
		localStorage.getItem('settings')
	);

	const navigate = useNavigate();

	useEffect(() => {
		navigate('/');
		if (settingsItem) {
			setSelectedSidebar(settingsItem);
		}
		setSettingsItem(localStorage.getItem('settings'));
	}, [settingsItem]);

	// JSX
	return (
		<div>
			{selectedSidebar === 'Users' && <UsersTable />}
			{selectedSidebar === 'Roles' && <RoleTable />}
			{selectedSidebar === 'Integrations' && (
				<Integrations
					setSelectedSidebar={setSelectedSidebar}
					openDrawerHandler={openDrawerHandler}
				/>
			)}
			{selectedSidebar === 'Configurations' && (
				<Configurations
					closeDrawerByAnimation={closeDrawerByAnimation}
					setSelectedSidebar={setSelectedSidebar}
				/>
			)}
		</div>
	);
};

export default SettingsBody;

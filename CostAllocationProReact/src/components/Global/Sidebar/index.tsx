import { Button, Layout, Menu } from 'antd';
import { FC } from 'react';
import styles from './index.module.scss';
import './index.scss';
import { SidebarProps } from './types';

// Global sidebar
const Sidebar: FC<SidebarProps> = (props) => {
	// Inits
	const { Sider } = Layout;
	const { handleSidebar, items, isGetSupportButton, selectedSidebar } = props;

	// JSX
	return (
		<Sider
			style={{
				background: items?.length === 0 ? '#f8f1e9' : '#344735',
				maxHeight: '100%',
				height: '100%',
				overflow: 'auto',
			}}
			className={styles.sidebar}
		>
			<div className={styles.sidebar__wrapper}>
				<Menu
					mode="inline"
					selectedKeys={[selectedSidebar]}
					defaultSelectedKeys={[selectedSidebar]}
					items={items}
					onClick={handleSidebar}
					className="menu-item "
					style={{
						background: '#344735',
						padding: 0,
					}}
				/>
				{isGetSupportButton && (
					<div className={styles.sidebar__support}>
						<Button
							type="primary"
							ghost={true}
							className={styles['sidebar__support--button']}
						>
							Get Support
						</Button>
					</div>
				)}
			</div>
		</Sider>
	);
};

export default Sidebar;

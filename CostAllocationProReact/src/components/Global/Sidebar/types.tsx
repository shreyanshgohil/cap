import type { MenuProps } from 'antd';

export type SidebarProps = {
	handleSidebar?: (data: any) => void;
	items: MenuProps['items'];
	isGetSupportButton: boolean;
	selectedSidebar: string;
};

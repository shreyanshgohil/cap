export type SideDrawerProps = {
	children?: any;
	isOpen: boolean;
	closeDrawerByAnimation: () => void;
	removeDrawerFromDom: () => void;
	headerTitle: string;
	position: string;
	width: string;
	setSelectedRole?: () => any;
	setEditSelectedRole?: any;
	editSelectedRole?: any;
};

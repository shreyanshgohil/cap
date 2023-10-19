export interface SideDrawerBodyProps {
	closeDrawerByAnimation: () => void;
	permissions: PermissionProps[];
	selectedRole: any;
}

export interface PermissionProps {
	moduleName: string;
	isParentModule: boolean;
	all: boolean;
	view: boolean;
	edit: boolean;
	sortId?: number;
	delete: boolean;
}

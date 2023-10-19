export interface UserProfileModalProps {
	isProfileModalOpen: boolean;
	handleCancel: () => void;
}

export interface ProfileData {
	firstName: string;
	lastName: string;
	email?: string;
	profileImg?: any;
	phone: string;
}

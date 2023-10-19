export interface DisconnectModalInterface {
	isModalOpen: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	text?: string;
	buttonText?: string;
	buttonColor?: string;
	image?: string;
	isLoading?: boolean;
	isReconnect?: boolean;
}

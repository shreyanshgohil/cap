export interface SyncProps {
	syncDate: Date;
	tooltip: string;
	handleSync: () => void;
	isLastSyncNeeded?: boolean;
	isLoading?: boolean;
	title?: string;
}

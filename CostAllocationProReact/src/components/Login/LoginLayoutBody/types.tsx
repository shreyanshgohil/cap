/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { SingleUserInput } from 'components/Global/InputWithLabel/types';
export interface LoginLayoutBodyProps {
	title: string;
	description?: string;
	formData: SingleUserInput[];
	buttonTitle: string;
	action?: any;
	redirectText?: string;
	redirectUrl?: string;
	data?: any;
	onSubmit?: any;
	isLoading?: boolean;
}

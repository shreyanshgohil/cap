export interface SingleUserInput {
	title: string;
	id: string;
	type: string;
	name: string;
	svg?: any;
	placeHolder: string;
	rules: any;
	required?: boolean;
}

export interface ingleUserInputInputWithLabelAndSvgProps {
	singleUserInput: SingleUserInput;
	disabled?: boolean;
	focus?: boolean;
}

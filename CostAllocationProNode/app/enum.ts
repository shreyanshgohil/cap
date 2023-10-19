export enum ResponseStatus {
	Success = 200,
	Created = 201,
	Error = 400,
	Unauthorized = 401,
	Forbidden = 403,
	NoContent = 204,
}

export enum PayPeriodStatus {
	CURRENT = 1,
	POSTED = 2,
}

export enum TimeSheetsStatus {
	PUBLISHED = 'Published',
	DRAFT = 'Draft'
}
export interface AuthTokenInterface {
	access_token: string;
	realmId: string;
	refresh_token: string;
}

export interface QuickBooksEmployee {
	Id: string;
	DisplayName: string;
	GivenName: string;
	MiddleName?: string;
	FamilyName: string;
	PrimaryEmailAddr?: {
		Address: string;
	};
	PrimaryPhone?: {
		FreeFormNumber: string;
	};
	PrimaryAddr?: {
		Id?: string;
		CountrySubDivisionCode?: string;
		City?: string;
		PostalCode?: string;
		Line1?: string;
		Line2?: string;
	};
	HireDate?: string;
	EmploymentType?: string;
	SSN?: string;
	BirthDate?: string;
	Gender?: string;
	EmployeeNumber?: string;
	ReleasedDate?: string;
	Released?: boolean;
	PayrollInfo?: {
		PayFrequency?: string;
		Salary?: number;
		HourlyRate?: number;
		HiredDate?: string;
		WorkersCompensationCode?: string;
		WorkersCompensationRate?: number;
	};
	Active?: boolean;
	// Add more properties as needed for your use case
}

/* eslint-disable no-prototype-builtins */
export const employeeFormationDataHandler = (singleEmployeeData: any) => {
	const obj: any = {};
	obj['employeeName'] = singleEmployeeData.fullName;
	obj['totalLaborBurden'] = '0.00';
	for (const singleFieldObj of singleEmployeeData.employeeCostField) {
		obj[singleFieldObj.field.id] = singleFieldObj.costValue[0].value;
		obj[`value_${singleFieldObj.field.id}`] = singleFieldObj.costValue[0].id;
		obj[`section_${singleFieldObj.field.id}`] =
			singleFieldObj.field.configurationSectionId;
	}
	return obj;
};

export function formatNumberWithCommas(number: any) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getSearchConditionSQL(searchCondition: any) {
	const conditions = [];

	// Loop through the key-value pairs in searchCondition
	for (const key in searchCondition) {
		if (searchCondition.hasOwnProperty(key)) {
			// Assuming the key represents a column name in your database
			// You may need to sanitize and validate the key to prevent SQL injection

			// Assuming the value is what you want to search for
			// You may need to sanitize and validate the value as well

			// Construct the SQL condition and push it to the conditions array
			conditions.push(`"${key}" = '${searchCondition[key]}'`);
		}
	}

	// Join the conditions with 'AND' and return as a single SQL condition
	return conditions.join(' AND ');
}

export function minutesToHoursAndMinutes(minutes: number) {
	if (isNaN(minutes)) {
		return 'Invalid input';
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours === 0) {
		return `00:${remainingMinutes}`;
	} else if (remainingMinutes === 0) {
		return `${hours}:00`;
	} else {
		return `${hours}:${remainingMinutes}`;
	}
}

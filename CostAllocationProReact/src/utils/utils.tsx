import { monthNames } from 'constants/Data';
import moment from 'moment';
import toast from 'react-hot-toast';
import { getApi, postApi } from 'redux/apis';

export const toastText = (message: string, type: string) => {
	switch (type) {
		case 'success':
			toast.success(message, {
				style: {
					fontSize: '16px',
				},
			});

			break;

		case 'error':
			toast.error(message, {
				style: {
					fontSize: '16px',
				},
			});
			break;
	}
};

export const formatPhoneNumber = (phoneNumber: string) => {
	// Remove all non-numeric characters from the input
	const cleanedNumber = phoneNumber.replace(/\D/g, '');

	// Define the phone number format (e.g., "(XXX) XXX-XXXX")
	const format = '($1) $2-$3';

	// Apply the mask to the cleaned number using a regular expression
	const maskedNumber = cleanedNumber.replace(/(\d{3})(\d{3})(\d{4})/, format);

	return maskedNumber;
};

export const getMonthAfter12Months = (currentMonth: number) => {
	// Parse the input month to a Date object
	const date = new Date(`2023-${currentMonth}-01`); // We assume the year is 2023 for simplicity

	// Add 12 months to the current date
	date.setMonth(date.getMonth() + 11);

	// Get the new month (0-11, where 0 is January and 11 is December)
	const newMonth = date.getMonth();

	// Return the new month as a number (add 1 to get the month number in the range 1-12)

	return monthNames[newMonth];
};

export const getPermissionObject = (
	permissionObj: any,
	allPermissions: any
) => {
	let formattedArray: any = [];
	const updatedAllPermission = allPermissions.map((singlePermission: any) => {
		return {
			...singlePermission,
			isBold: false,
		};
	});

	// const updatedPermissionObj = []
	for (const singlePermissionObj of permissionObj) {
		let tempArray = [];
		if (singlePermissionObj.name) {
			tempArray.push({
				permissionName: singlePermissionObj.name,
				isBold: true,
			});
		}

		const filteredPermissions = updatedAllPermission.filter(
			(singlePermission: any) => {
				return singlePermissionObj.items.includes(singlePermission.sortId);
			}
		);
		tempArray = [...tempArray, ...filteredPermissions];
		formattedArray = [...formattedArray, ...tempArray];
	}

	return formattedArray;
};

export const checkPermission = (
	allPermissions: any,
	requiredPermission: any
) => {
	if (!allPermissions) {
		return false;
	}
	const permissionsList = allPermissions;
	const permission = permissionsList?.find(
		(singlePermission: any) =>
			singlePermission.permissionName === requiredPermission.permissionName
	);

	if (permission) {
		const permitted = requiredPermission.permission.some(
			(singlePermission: string) => permission[singlePermission]
		);
		return permitted || permission['all'];
	} else {
		return false;
	}
};

export const isValidConfigurationSettings = (configurationsDataCopy: any) => {
	let fields: any = [];
	let remainingId = null;
	for (const configuration of Object.values(configurationsDataCopy) as any) {
		fields = [...fields, ...Object.values(configuration.fields)];
	}

	for (const configuration of Object.values(configurationsDataCopy) as any) {
		const fondedConfiguration: any = Object.values(configuration.fields).find(
			(el: any) => el.isEditing === true
		);
		if (fondedConfiguration) {
			remainingId = `${configuration.id}${fondedConfiguration.id}`;
			break;
		}
	}

	const isValid = fields.every((singleField: any) => singleField.value);
	const isAllEditableDone = fields.every(
		(singleField: any) => singleField.isEditing === false
	);

	const isBlankLabel = fields.some(
		(singleField: any) => singleField.label.trim() === ''
	);
	return {
		isValidSelectBox: isValid,
		isAddEditFalse: isAllEditableDone,
		isBlankLabel: isBlankLabel,
		remainingId: remainingId,
	};
};

export const filterQBEntities = (
	configurationsDataCopy: any,
	type: string,
	qbValues: any
) => {
	const qbValuesCopy = JSON.parse(JSON.stringify(qbValues));
	let fields: any = [];
	const filteredItems: any = [];

	for (const configuration of Object.values(configurationsDataCopy) as any) {
		if (configuration.type === type) {
			fields = [...fields, ...Object.values(configuration.fields)];
		}
	}

	const fieldsSelectedValues = fields.map(
		(singleField: any) => singleField.value
	);

	qbValuesCopy.forEach((single: any) => {
		if (fieldsSelectedValues.includes(single.Id)) {
			single.isDisable = true;
			filteredItems.push(single);
		} else {
			filteredItems.push(single);
		}
	});

	return filteredItems;
};

export const phoneNumberFormatHandler = (phoneNumber: any = '') => {
	const inputPhoneNumber = phoneNumber?.replace(/\D/g, ''); // Remove non-digit characters
	let formattedPhoneNumber = '';

	if (inputPhoneNumber.length > 0) {
		formattedPhoneNumber = `(${inputPhoneNumber.slice(0, 3)}`;

		if (inputPhoneNumber.length >= 4) {
			formattedPhoneNumber += `) ${inputPhoneNumber.slice(3, 6)}`;
		}

		if (inputPhoneNumber.length >= 7) {
			formattedPhoneNumber += `-${inputPhoneNumber.slice(6, 10)}`;
		}
	}

	return formattedPhoneNumber;
};

export const TimeAgo = (date: any) => {
	// const sourceTimeZone = 'America/Los_Angeles';
	const localDate = moment(date).utcOffset(new Date().getTimezoneOffset() * -1);
	const formattedTimeAgo = localDate.fromNow();

	return formattedTimeAgo;
	// return <span>{formattedTimeAgo}</span>;
};

export const checkTimeFormat = (value: string) => {
	let result = true;
	for (let i = 0; i < value.length; i++) {
		if (
			!(value.charCodeAt(i) >= 48 && value.charCodeAt(i) <= 58) ||
			value === ''
		) {
			result = false;
			break;
		}
	}
	return result;
};

export function convertToHyphenCase(inputString: string) {
	// Convert the input string to lowercase
	const lowerCaseString = inputString.toLowerCase();

	// Replace spaces with hyphens
	const hyphenCaseString = lowerCaseString.replace(/\s+/g, '-');

	return hyphenCaseString;
}

export const createPDF = async (date: any, companyName: string) => {
	const response = await getApi('/employee-cost', {
		companyId: localStorage.getItem('companyId'),
		date: date,
		page: 1,
		limit: 100000,
	});
	const dateCopy = new Date(date);
	const formattedDate = dateCopy.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
	});
	let top: any = `<div style="margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, Helvetica, sans-serif;">
			<div style="margin-bottom:20px;  ">
							<img src='https://costallocationspro.s3.amazonaws.com/cap-logonew.png' width="180px" style="float: left;"/>
							<p style="text-align: center; padding-top: 12px; padding-right:150px">Employee Cost</p>
			</div>
			 <div>
        <p style="display: inline-block;">Date : ${formattedDate}</p>
        <p style="display: inline-block; float: right;">Company : ${companyName}</p>
      </div>
      <table
        style="border-collapse: collapse;  width: 100%;"
      >
        <thead style="color: #fff; background: #333">
          <tr>
            <td>Employee Name</td>
            <td>Employee Type</td>
            <td>Maximum allocate hours per year</td>
            <td>Maximum Vacation/PTO hours per year</td>
            <td>Total Salary</td>
            <td>Total Fringe</td>
            <td>Total Payroll Taxes</td>
            <td>Total Labor Burden</td>
          </tr>
        </thead>
        <tbody>`;

	response.data.data.employees.forEach((single: any) => {
		const employeeType = single.employeeCostField.find(
			(single: any) => single.field.name === 'Employee Type'
		).costValue[0].value;
		const maximumAllocatedVacationHoursPerYear = single.employeeCostField.find(
			(single: any) =>
				single.field.name === 'Maximum Vacation/PTO hours per year'
		).costValue[0].value;
		const maximumAllocatedHoursPerYear = single.employeeCostField.find(
			(single: any) => single.field.name === 'Maximum allocate hours per year'
		).costValue[0].value;
		const totalSalary = single.employeeCostField.find(
			(single: any) => single.field.name === 'Total Salary'
		).costValue[0].value;
		const totalFringe = single.employeeCostField.find(
			(single: any) => single.field.name === 'Total Fringe'
		).costValue[0].value;
		const TotalPayrollTexes = single.employeeCostField.find(
			(single: any) => single.field.name === 'Total Payroll Taxes'
		).costValue[0].value;

		top += `<tr
            style="
              background-color: #ddd;
              font-weight: 700;
              border-bottom: 1px solid #fff;
            "
          >
            <td>${single.fullName}</td>
            <td>${employeeType ? convertToTitleCase(employeeType) : 'N/A'}</td>
            <td>${maximumAllocatedHoursPerYear}</td>
            <td>${maximumAllocatedVacationHoursPerYear}</td>
            <td>$${formatNumberWithCommas(totalSalary)}</td>
            <td>$${formatNumberWithCommas(totalFringe)}</td>
            <td>$${formatNumberWithCommas(TotalPayrollTexes)}</td>
            <td>$${formatNumberWithCommas(
							(
								Number(totalFringe) +
								Number(totalSalary) +
								Number(TotalPayrollTexes)
							).toFixed(2)
						)}</td>
          </tr>`;
	});

	const footer = `</tbody>
      </table>
    </div>`;
	return top + footer;
};
export const downLoadPdfHours = async (date: any, companyName: string) => {
	const data = await createPDF(date, companyName);
	const response = await postApi('/time-activities/exportpdf', {
		html: [btoa(data!)],
		filename: `Employee Cost-${moment(new Date()).format('MMDDYYYYhhmmss')}`,
	});

	const pdf = {
		file: response?.data?.data,
		fileName: `Employee Cost-${moment(new Date()).format('MMDDYYYYhhmmss')}`,
	};
	// const pdfLink = `${pdf.file}`;
	const anchorElement = document.createElement('a');
	const fileName = `${pdf.fileName}.pdf`;
	anchorElement.href = 'data:application/pdf;base64,' + pdf?.file;
	anchorElement.download = fileName;
	anchorElement.click();
};

export const createPDFPercentage = async (
	payPeriodId: string,
	companyName: string,
	range: string
) => {
	const response = await getApi('/employee-cost', {
		companyId: localStorage.getItem('companyId'),
		payPeriodId,
		page: 1,
		limit: 100000,
		isPdf: true,
	});

	let top: any = `<div style="margin: 0; padding: 0; box-sizing: border-box; font-family: Arial">
			<div style="margin-bottom:20px;  ">
							<img src='https://costallocationspro.s3.amazonaws.com/cap-logonew.png' width="180px" style="float: left;"/>
							<p style="text-align: center; padding-top: 12px; padding-right:150px">Employee Cost</p>
			</div>
			 <div>
        <p style="display: inline-block;">Date : ${range}</p>
        <p style="display: inline-block; float: right;">Company : ${companyName}</p>
      </div>
      <table
        style="border-collapse: collapse;  width: 100%;"
      > 
          <tr>
            <th style="background-color: #333; color: white; padding: 8px; text-align: left;">Employee Name</th>
            <th style="background-color: #333; color: white; padding: 8px 0px 8px 8px; text-align: right;">Total Salary</th>
            <th style="background-color: #333; color: white; padding: 8px 0px 8px 8px; text-align: right;">Total Fringe</th>
            <th style="background-color: #333; color: white; padding: 8px 0px 8px 8px; text-align: right;">Total Payroll Taxes</th>
            <th style="background-color: #333; color: white; padding: 8px 20px 8px 8px; text-align: right;">Total Labor Burden</th>
          </tr>
         <tbody>`;

	let totalEmployeeSalary = 0;
	let totalFringeSalary = 0;
	let totalPayrollTaxes = 0;

	response.data.data.employees.forEach((single: any) => {
		const totalSalary = single.employeeCostField.find(
			(single: any) => single.field.name === 'Total Salary'
		).costValue[0].value;
		totalEmployeeSalary += Number(totalSalary);
		const totalFringe = single.employeeCostField.find(
			(single: any) => single.field.name === 'Total Fringe'
		).costValue[0].value;
		totalFringeSalary += Number(totalFringe);
		const TotalPayrollTexes = single.employeeCostField.find(
			(single: any) => single.field.name === 'Total Payroll Taxes'
		).costValue[0].value;
		totalPayrollTaxes += Number(TotalPayrollTexes);
		top += `<tr
            style="
              background-color: #ddd;
              font-weight: 700;
              border-bottom: 1px solid #fff;
            "
          >
            <td style="padding-bottom:12px;padding-top:12px;padding-left:12px;">${
							single.fullName
						}</td>
            <td style="text-align: right;">$${formatNumberWithCommasV2(
							totalSalary
						)}</td>
            <td style="text-align: right;">$${formatNumberWithCommasV2(
							totalFringe
						)}</td>
            <td style="text-align: right;">$${formatNumberWithCommasV2(
							TotalPayrollTexes
						)}</td>
            <td style="text-align: right;padding-right:20px;">$${formatNumberWithCommasV2(
							Number(totalFringe) +
								Number(totalSalary) +
								Number(TotalPayrollTexes)
						)}</td>
          </tr>`;
	});
	const bottom = `<tr
            style="
              background-color: #ddd;
              font-weight: 700;
              border-bottom: 1px solid #fff;
            "
          >
            <td style="padding-bottom:12px;padding-top:12px;padding-left:12px;">Total</td>
            <td style="text-align: right;">$${formatNumberWithCommasV2(
							totalEmployeeSalary
						)}</td>
            <td style="text-align: right;">$${formatNumberWithCommasV2(
							totalFringeSalary
						)}</td>
            <td style="text-align: right;">$${formatNumberWithCommasV2(
							totalPayrollTaxes
						)}</td>
            <td style="text-align: right; padding-right:20px;">$${formatNumberWithCommasV2(
							Number(totalEmployeeSalary) +
								Number(totalFringeSalary) +
								Number(totalPayrollTaxes)
						)}</td>
          </tr>`;
	const footer = `</tbody>
      </table>
    </div>`;
	return top + bottom + footer;
};
export const downLoadPdfPercentage = async (
	payPeriodId: string,
	companyName: string,
	range: string
) => {
	const data = await createPDFPercentage(payPeriodId, companyName, range);
	const response = await postApi('/time-activities/exportpdf', {
		html: [btoa(data!)],
		filename: `Employee Cost-${moment(new Date()).format('MMDDYYYYhhmmss')}`,
	});

	const pdf = {
		file: response?.data?.data,
		fileName: `Employee Cost-${moment(new Date()).format('MMDDYYYYhhmmss')}`,
	};
	// const pdfLink = `${pdf.file}`;
	const anchorElement = document.createElement('a');
	const fileName = `${pdf.fileName}.pdf`;
	anchorElement.href = 'data:application/pdf;base64,' + pdf?.file;
	anchorElement.download = fileName;
	anchorElement.click();
};

export const createPDFTimeActivities = async (
	query: any,
	companyName: string
) => {
	const latestData: any = await getApi('/time-activities', {
		companyId: localStorage.getItem('companyId'),
		...query,
	});

	const formatedStartDate = moment(query?.payPeriodData?.startDate).format(
		'MM/DD/YYYY'
	);
	const formatedEndDate = moment(query?.payPeriodData?.endDate).format(
		'MM/DD/YYYY'
	);

	const top = `	
						<div style="margin: 0; padding: 0; box-sizing: border-box; font-family: Arial"> 
						<div style="margin-bottom:20px;  ">
							<img src='https://costallocationspro.s3.amazonaws.com/cap-logonew.png' width="180px" style="float: left;"/>
							<p style="text-align: center; padding-top: 12px; padding-right:150px;">Time Activity</p>
						</div>
						<div>
							<p style="display: inline-block;">Date : ${
								formatedStartDate === formatedEndDate
									? `Till ${formatedEndDate}`
									: `${formatedStartDate} to ${formatedEndDate}`
							} </p>
							<p style="display: inline-block; float: right;">Company : ${companyName}</p>
						</div>
							<div>
							<table style="border-collapse: separate; width: 100%; border-spacing: 0px 2px;">
							
								<tr>
								<th style="background-color: #333; color: white; padding: 8px; text-align: left;">Activity Date</th>
								<th style="background-color: #333; color: white; padding: 8px; text-align: left;">Employee</th>
								<th style="background-color: #333; color: white; padding: 8px; text-align: left;">Customer</th>
								<th style="background-color: #333; color: white; padding: 8px; text-align: left;">Class</th>
								<th style="background-color: #333; color: white; padding: 8px; text-align: left;">Hrs</th>
								</tr>	
					`;

	let body = '';

	latestData?.data?.data?.timeActivities?.forEach((singleActivity: any) => {
		const date = moment(singleActivity?.activityDate).format('MM-DD-YYYY');
		if (
			singleActivity?.SplitTimeActivities &&
			singleActivity?.SplitTimeActivities.length > 0
		) {
			singleActivity?.SplitTimeActivities.forEach(
				(singleSplitActivity: any) => {
					body += `<tr>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
											 	${date}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												 	${singleActivity?.employee ? singleActivity?.employee?.fullName : 'NA'}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${singleSplitActivity?.customerName ? singleSplitActivity?.customerName : 'NA'}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${singleSplitActivity?.className ? singleSplitActivity?.className : 'NA'}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${singleSplitActivity?.hours?.padStart(
													2,
													'0'
												)}:${singleSplitActivity?.minute?.padStart(2, '0')}
											</td>
										</tr>`;
				}
			);
		} else {
			body += `<tr>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${date}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${singleActivity?.employee ? singleActivity?.employee?.fullName : 'NA'}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${singleActivity?.customerName ? singleActivity?.customerName : 'NA'}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${singleActivity?.className ? singleActivity?.className : 'NA'}
											</td>
											<td style="background-color: #ddd; padding: 8px; text-align: left;">
												${singleActivity?.hours?.padStart(2, '0')}:${singleActivity?.minute?.padStart(
				2,
				'0'
			)}
											</td>
										</tr>`;
		}
	});

	const footer = `</tbody>
						</table>
					</div>`;

	const htmlData = top + body + footer;
	return htmlData;
};

export const downloadPDFTimeActivities = async (
	query: any,
	companyName: string
) => {
	const htmlData = await createPDFTimeActivities(query, companyName);

	const dataArr = [btoa(htmlData!)];

	// const formatedStartDate = moment(query?.startDate).format('MM/DD/YYYY');
	// const formatedEndDate = moment(query?.endDate).format('MM/DD/YYYY');

	const response = await postApi('/time-activities/exportpdf', {
		html: dataArr,
		filename: `Time Log Report_${moment(new Date()).format('MMDDYYYYhhmmss')} `,
	});

	const pdf = {
		file: response?.data?.data,
		fileName: `Time Log Report_${moment(new Date()).format('MMDDYYYYhhmmss')} `,
	};
	// const pdfLink = `${pdf.file}`;
	const anchorElement = document.createElement('a');
	const fileName = `${pdf.fileName}.pdf`;
	anchorElement.href = 'data:application/pdf;base64,' + pdf?.file;
	anchorElement.download = fileName;
	anchorElement.click();
};

export function convertToTitleCase(inputString: any) {
	// Split the input string by underscores
	const words = inputString.split('_');

	// Capitalize the first letter of each word
	const capitalizedWords = words.map((word: any) => {
		return word.charAt(0).toUpperCase() + word.slice(1);
	});

	// Join the words with a space
	const result = capitalizedWords.join(' ');

	return result;
}

export function formatNumberWithCommas(number: any) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatNumberWithCommasV2(number: any) {
	return Number(number)
		.toFixed(2)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function divideTimeInHalf(hours: any, minutes: any) {
	// Convert hours and minutes to total minutes
	const totalMinutes = hours * 60 + minutes;

	// Calculate half of the total minutes
	const halfTotalMinutes = Math.floor(totalMinutes / 2);

	// Calculate the new hours and minutes
	const halfHours = Math.floor(halfTotalMinutes / 60);
	const halfMinutes = halfTotalMinutes % 60;

	// Return an object with half hours and half minutes

	return {
		halfHours,
		halfMinutes,
	};
}

export function addTimeToTime(
	hoursToAdd: number,
	minutesToAdd: number,
	currentHours: number,
	currentMinutes: number
) {
	// Convert current time to total minutes
	const totalMinutes = currentHours * 60 + currentMinutes;

	// Add the hours and minutes to the total minutes
	const newTotalMinutes = totalMinutes + hoursToAdd * 60 + minutesToAdd;

	// Calculate the new hours and minutes
	const newHours = Math.floor(newTotalMinutes / 60);
	const newMinutes = newTotalMinutes % 60;

	// Return an object with the new hours and minutes
	return {
		newHours,
		newMinutes,
	};
}

export function isDateRangeDisabled(
	startDate: any,
	endDate: any,
	disabledDates: any
) {
	// Convert the startDate and endDate strings to Date objects
	startDate = new Date(startDate);
	endDate = new Date(endDate);

	// Loop through the range of dates from startDate to endDate
	for (
		let currentDate = startDate;
		currentDate <= endDate;
		currentDate.setDate(currentDate.getDate() + 1)
	) {
		// Convert the currentDate to a string in the format 'YYYY-MM-DD'
		const currentDateStr = currentDate.toISOString().split('T')[0];

		// Check if the currentDateStr is in the list of disabledDates
		if (disabledDates.includes(currentDateStr)) {
			return true; // Date in range is disabled
		}
	}

	return false; // No disabled dates found in the range
}

export function isNullOrUndefined(value: any) {
	return null === value || undefined === value;
}

export function isBlank(value: any) {
	return (
		null === value ||
		undefined === value ||
		value.toString().trim().length === 0
	);
}

export function hasText(value: any) {
	return !isBlank(value);
}
export function divideTimeBySlots(
	hours: number,
	minutes: number,
	divisor: number
) {
	if (divisor <= 0) {
		return 'Divisor must be greater than zero';
	}

	const totalTimeInMinutes = hours * 60 + minutes;
	const dividedTimeInMinutes = totalTimeInMinutes / divisor;

	const dividedHours = Math.floor(dividedTimeInMinutes / 60);
	const dividedMinutes = Math.floor(dividedTimeInMinutes % 60);

	return { dividedHours, dividedMinutes };
}

export function makeTotalTime(timeArray: any) {
	let totalHours = 0;
	let totalMinutes = 0;

	// Loop through the array of time objects and add up the hours and minutes
	for (const timeObj of timeArray) {
		if (
			timeObj &&
			typeof timeObj.minutes === 'number' &&
			typeof timeObj.hours === 'number'
		) {
			totalHours += timeObj.hours;
			totalMinutes += timeObj.minutes;
		}
	}

	// Calculate carryover hours from extra minutes
	totalHours += Math.floor(totalMinutes / 60);
	totalMinutes %= 60;
	return { hours: totalHours, minutes: totalMinutes };
}

export function timeDifference(time1: any, time2: any) {
	// Extract hours and minutes from the time objects
	const { hours: hours1, minutes: minutes1 } = time1;
	const { hours: hours2, minutes: minutes2 } = time2;

	// Calculate the total minutes for each time
	const totalMinutes1 = hours1 * 60 + minutes1;
	const totalMinutes2 = hours2 * 60 + minutes2;

	// Calculate the absolute difference in minutes
	const minuteDifference = Math.abs(totalMinutes1 - totalMinutes2);

	// Calculate hours and remaining minutes
	const hoursDifference = Math.floor(minuteDifference / 60);
	const remainingMinutes = minuteDifference % 60;

	return { hours: hoursDifference, minutes: remainingMinutes };
}

export function generateDateRange(startDateStr: any, endDateStr: any) {
	const dateList = [];
	const startDate = new Date(startDateStr);
	const endDate = new Date(endDateStr);

	while (startDate <= endDate) {
		const year = startDate.getFullYear();
		const month = String(startDate.getMonth() + 1).padStart(2, '0');
		const date = String(startDate.getDate()).padStart(2, '0');
		dateList.push(`${year}-${month}-${date}`);
		startDate.setDate(startDate.getDate() + 1);
	}

	return dateList;
}

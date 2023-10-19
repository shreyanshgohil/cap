import axios from 'axios';
import jwtDecode from 'jwt-decode';

const endPoint = process.env.REACT_APP_API_ENDPOINT;

const willExpire = (token: string, inMinute = 10) => {
	const userData: any = jwtDecode(token);

	if (!userData.exp) {
		return false;
	}
	const exp = userData.exp * 1000;
	const date = new Date();
	date.setMinutes(date.getMinutes() + inMinute);
	return date.getTime() > exp;
};

const checkTokenExpire = async () => {
	const accessExpire = willExpire(localStorage.accessToken, 5 * 60);

	let accessToken = localStorage.accessToken;
	let refreshToken = localStorage.refreshToken;

	if (accessExpire) {
		try {
			const response = await axios.post(`${endPoint}/auth/refresh-token`, {
				accessToken: localStorage.accessToken,
				refreshToken: localStorage.refreshToken,
			});

			if (response.data.data) {
				accessToken = response.data.data.accessToken;
				refreshToken = response.data.data.refreshToken;
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('refreshToken', refreshToken);
			}

			return { accessToken, refreshToken };
		} catch (err) {
			window.location.href = '/';
			localStorage.clear();
		}
	}

	return { accessToken, refreshToken };
};

const apiConfig = async (flag = false) => {
	if (localStorage.getItem('accessToken')) {
		const tokens = await checkTokenExpire();

		return {
			headers: {
				Authorization: `bearer ${tokens.accessToken}`,
				RefreshToken: `bearer ${tokens.refreshToken}`,
				'Content-Type': flag ? 'multipart/form-data' : 'application/json',
			},
			method: 'PUT,DELETE,POST,GET,OPTION',
			withCredentials: true,
		};
	}
	return { withCredentials: true };
};

export const getApi = async (url?: string, params?: any) => {
	const configData = await apiConfig();
	return axios.get(`${endPoint}${url}`, {
		params: params,
		...configData,
	});
};

export const getApiCSV = async (url?: string, params?: any) => {
	const configData = await apiConfig();
	return axios.get(`${endPoint}${url}`, {
		params: params,
		responseType: 'arraybuffer',
		...configData,
	});
};

export const postApi = async (
	url: string,
	apiData?: any,
	flag?: boolean,
	params?: any
) => {
	const configData = await apiConfig(flag);
	return axios.post(`${endPoint}${url}`, apiData, {
		params,
		...configData,
	});
};

export const postWithParams = async (
	url: string,
	apiData?: any,
	flag?: boolean
) => {
	const configData = await apiConfig(flag);
	return axios.post(`${endPoint}${url}`, apiData, configData);
};

export const putApi = async (url: string, apiData: any, flag?: boolean) => {
	const configData = await apiConfig(flag);
	return axios.put(`${endPoint}${url}`, apiData, configData);
};

export const putApiNoHeader = async (url: string, apiData: any) => {
	return axios.put(`${endPoint}${url}`, apiData, {
		headers: {
			Authorization: `bearer ${localStorage.accessToken}`,
			RefreshToken: `bearer ${localStorage.refreshToken}`,
		},
	});
};

export const deleteApi = async (url: string) => {
	const configData = await apiConfig();
	return axios.delete(`${endPoint}${url}`, configData);
};

export const deleteApiWithData = async (url: string, apiData: any) => {
	const configData = await apiConfig();
	return axios.delete(`${endPoint}${url}`, {
		data: apiData,
		...configData,
	});
};

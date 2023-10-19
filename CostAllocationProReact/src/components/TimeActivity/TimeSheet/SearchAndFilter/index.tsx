import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Space } from 'antd';
import { FC } from 'react';
import styles from './index.module.scss';
import './index.scss';
import { SearchAndFilterProps } from './types';
import { Select } from 'antd/lib';
import PayPeriodFilter from 'components/Global/PayPeriodFilter';

// For search filter and paginate
const SearchAndFilter: FC<SearchAndFilterProps> = (props) => {
	// Init
	const {
		performSearchHandler,
		searchValue,
		createdBy,
		userOptions,
		onChangeCreatedBy,
		payPeriodId,
		onChangePayPeriodId
	} = props;

	// const presets = [
	// 	{
	// 		label: <span aria-label="Current Time to End of Day">Now ~ EOD</span>,
	// 		value: [dayjs(), dayjs().endOf('day')],
	// 	},
	// 	...rangePresets,
	// ];

	const handleChangeCreatedBy = (value: string | null) => {
		onChangeCreatedBy && onChangeCreatedBy(value);
	}

	// JSX
	return (
		<div className={styles['search-filter']}>
			<div className={styles['search-filter__wrapper']}>
				<Row>
					<Col>
						<Space>
							<Input
								className={styles['search-filter__search']}
								placeholder="Search here..."
								suffix={<SearchOutlined />}
								onChange={(e) => performSearchHandler(e.target.value)}
								value={searchValue}
								size="large"
							/>
						</Space>
					</Col>
					<Col>
						<Select
							className={styles['pay-period-filter']}
							onChange={(value) => handleChangeCreatedBy(value)}
							size="large"
							placeholder="Created By"
							value={createdBy}
							showSearch
							filterOption={(input, option: any) =>
								(option?.children as string)
									.toLowerCase()
									.indexOf(input.toLowerCase()) >= 0
							}
						>
							<Select.Option value={''}>
								All
							</Select.Option>
							{userOptions?.map((singleUser: any, index: number) => {
								return (
									<Select.Option value={singleUser?.id} key={index}>
										{singleUser.fullName}
									</Select.Option>
								);
							})}
						</Select>
					</Col>
					<Col>
						<PayPeriodFilter
							payPeriodId={payPeriodId}
							onChangePayPeriodId={(value: string) => {
								onChangePayPeriodId && onChangePayPeriodId(value);
							}}
						/>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default SearchAndFilter;

import { Col, DatePicker, Row, Space } from 'antd';
import { FC } from 'react';
import styles from './index.module.scss';
import { SearchAndFilterProps } from './types';
// For search filter and paginate
const SearchAndFilter: FC<SearchAndFilterProps> = (props) => {
	// Init
	const { performFilterHandler, payPeriodYear } = props;
	// JSX
	return (
		<div className={styles['search-filter']}>
			<div className={styles['search-filter__wrapper']}>
				<Row>
					<Col>
						<Space>
							{/* <Input
								className={styles['search-filter__search']}
								placeholder="Search user"
								suffix={<SearchOutlined />}
								onChange={performSearchHandler}
								value={searchValue}
								size="large"
							/> */}
							<DatePicker
								style={{ width: 200 }}
								onChange={performFilterHandler}
								size="large"
								picker="year"
								value={payPeriodYear}
							/>
						</Space>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default SearchAndFilter;

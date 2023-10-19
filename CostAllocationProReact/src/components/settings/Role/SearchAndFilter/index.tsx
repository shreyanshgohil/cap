import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select, Space } from 'antd';
import { FC } from 'react';
import styles from './index.module.scss';
import { SearchAndFilterProps } from './types';
// For search filter and paginate
const SearchAndFilter: FC<SearchAndFilterProps> = (props) => {
	// Init
	const { performSearchHandler, searchValue, performFilterHandler } = props;
	// JSX
	return (
		<div className={styles['search-filter']}>
			<div className={styles['search-filter__wrapper']}>
				<Row>
					<Col>
						<Space>
							<Input
								className={styles['search-filter__search']}
								placeholder="Search role"
								suffix={<SearchOutlined />}
								onChange={performSearchHandler}
								value={searchValue}
								size="large"
							/>
							<Select
								defaultValue="All"
								onChange={performFilterHandler}
								style={{ width: 200 }}
								options={[
									{ label: 'All', value: 'all' },
									{ label: 'Active', value: 'active' },
									{ label: 'Inactive', value: 'inactive' },
								]}
								size="large"
							/>
						</Space>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default SearchAndFilter;

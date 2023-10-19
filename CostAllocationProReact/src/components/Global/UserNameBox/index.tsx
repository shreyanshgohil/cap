import { FC } from 'react';
import { UserNameBoxProps } from './types';
import styles from './index.module.scss';

// Header name showing 1 section
const UserNameBox: FC<UserNameBoxProps> = (props) => {
	// intis
	const { name, imageUrl } = props;
	const nameArr = name.split(' ');
	const newName = (nameArr[0]?.charAt(0) || '') + (nameArr[1]?.charAt(0) || '');

	// Props
	return name ? (
		<div className={styles['user-name-box']}>
			{imageUrl ? (
				<img
					src={imageUrl}
					className={styles['user-name-box__profile-image']}
					crossOrigin={'anonymous'}
				/>
			) : (
				<p className={styles['user-name-box__name']}>{newName}</p>
			)}
		</div>
	) : null;
};

export default UserNameBox;

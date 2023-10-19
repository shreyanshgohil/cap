import { Link } from 'react-router-dom';
import './index.scss';

const Unauthorized = () => {
	return (
		<div className="unauthorized">
			<div className="lock"></div>
			<div className="message">
				<h1 className="unauthorized-h1">Access to this page is restricted</h1>
				<div className="go-back">
					<Link className="go-back-button" to="/">
						Go Back
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Unauthorized;

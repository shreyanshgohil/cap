import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastErrorSvg, ToastSuccessSvg } from 'utils/svgs';
import './App.scss';
function App() {
	return (
		<div className="App">
			<RouterProvider router={router} />
			<Toaster
				position="top-center"
				reverseOrder={false}
				containerClassName="toast-container-custom"
				toastOptions={{
					success: {
						icon: (
							<div className="toast-container-div">
								<ToastSuccessSvg />
							</div>
						),
						style: {
							backgroundColor: '#009049',
							color: '#fff',
							fontSize: '16px',
						},
					},
					error: {
						icon: (
							<div className="toast-container-div">
								<ToastErrorSvg />
							</div>
						),
						style: {
							backgroundColor: 'red',
							color: '#fff',
							fontSize: '16px',
						},
					},
				}}
			/>
		</div>
	);
}

export default App;

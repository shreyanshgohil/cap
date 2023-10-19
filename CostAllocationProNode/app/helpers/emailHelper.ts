import nodemailer from 'nodemailer';
import config from '../../config';

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
	host: config.smtpHost,
	port: Number(config.smtpPort),
	secure: false,
	auth: {
		user: config.smtpEmailLogin,
		pass: config.smtpPassword,
	},
});

// Send Email
const sendEmail = (options: nodemailer.SendMailOptions): Promise<any> => {
	return new Promise((resolve, reject) => {
		transporter.sendMail(options, (error, info) => {
			if (error) {
				console.error('Error sending email:', error);
				reject(error);
			}
			resolve(info);
		});
	});

	// Send the email with the reset token
	// const mailOptions = {
	// 	from: process.env.SMTP_USER,
	// 	to: email,
	// 	subject: 'Password Reset',
	// 	// text: `Please use the following token to reset your password: ${resetToken}`,
	// };
};

export default sendEmail;

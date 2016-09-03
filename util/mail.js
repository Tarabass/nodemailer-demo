/**
 * Created by Peter Rietveld (p.rietveld@live.com) on 01-Sep-16.
 *
 * Any use of the code written here-in belongs to the developer and is
 * hereby the owner. If used, one must have strict approval by the
 * developer of the code written here-in. The developer may at anytime
 * change, modify, add, or delete any content contained within.
 *
 * Copyright (c) 2016 Strictly Internet
 */
var fileUtil = require('../util/file');

module.exports = function() {
	return {
		smtpConfigPath: './config/smtp.config',

		attachmentsFolder: './uploads/',

		/*
		 * https://github.com/nodemailer/nodemailer
		 *
		 * http://stackoverflow.com/a/1461224/408487 => figure out smtp host
		 * http://stackoverflow.com/a/20100521/408487 => fix for: { [Error: unable to verify the first certificate] code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' }
		 *
		 * 'smtps://admin:rietveld79@peterrietveld.nl:465'
		 * 'smtps://djtarabass@gmail.com:rietveld79@smtp.gmail.com'
		 */
		sendMail: function(options) {
			options = options || {};
			// fix for: { [Error: unable to verify the first certificate] code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' }
			process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
			var me = this,
				nodemailer = require('nodemailer'),
				smtpConfig = me.readSmtpConfig(),
				transporter = nodemailer.createTransport(smtpConfig),
				from = options.from,
				to = options.to,
				subject = options.subject,
				content = options.content,
				attachments = me.formatAttachments(options.attachments),
				priority = options.priority || 'normal',
				callback = options.callback,
				mailOptions = {
					from: from,
					to: to,
					subject: subject, // Subject line
					text: content, // plaintext body
					html: content, // html body
					attachments: attachments,
					priority: priority
				};

			if(callback && typeof callback === 'function') {
				transporter.sendMail(mailOptions, function(error, info) {
					callback(error, info);
					me.deleteAttachments(attachments);
				});
			}
			else {
				console.log('Error: %', 'Callback required');
			}
		},

		formatAttachments: function(attachments) {
			var me = this;

			if(attachments && attachments.length > 0) {
				return attachments.map(function(file) {
					return {
						path: me.attachmentsFolder + file.filename,
						filename: file.originalname
					};
				});
			}
		},

		deleteAttachments: function(attachments) {
			if(attachments && attachments.length > 0) {
				attachments.forEach(function(file) {
					fileUtil.deleteFile(file.path);
				});
			}
		},

		readSmtpConfig: function() {
			var filePath = this.smtpConfigPath,
				smtpConfig;

			try {
				smtpConfig = fileUtil.readFile(filePath, false);
			}
			catch(e) {
				// ENOENT: no such file or directory
				if(e.code === 'ENOENT') {
					smtpConfig = {
						host: '',
						port: '',
						secure: true, // use SSL
						auth: {
							user: '',
							pass: ''
						}
					};

					fileUtil.writeFile(filePath, smtpConfig, false);
				}
			}

			return smtpConfig;
		},

		writeSmtpConfig: function(smtpConfig, callback) {
			var filePath = this.smtpConfigPath,
				result = null,
				err = null;

			try {
				fileUtil.writeFile(filePath, smtpConfig);
				result = {
					filePath: filePath,
					smtpConfig: smtpConfig,
					message: 'SMTP Settings saved'
				};
			}
			catch(e) {
				err = e;
			}

			if(callback && typeof callback === 'function') {
				callback.call(err, result);
			}
			else if(err) {
				throw err;
			}
		}
	};
}();
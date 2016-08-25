var express = require('express');
var router = express.Router();
var multer = require('multer');

/* GET home page. */
router.route('/')
	.get(function(req, res) {
		res.render('index', {
			title: 'Send mail'
		});
	});

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads');
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});
var upload = multer({ storage: storage }).fields([{ name: 'attachment', maxCount: 1 }]);

router.route('/sendmail')
	.post(upload, function(req, res) {
		var body = req.body,
			files = req.files;

		if(attachments && attachments.length > 0) {
			attachments = attachments.map(function(file) {
				return {
					path: './uploads/' + file.filename,
					filename: file.originalname
				};
			});
		}

		sendMail({
			from: body.from, // sender address. Example: '"DJ Tarabass" <djtarabass@gmail.com>',
			to: body.to, // list of receivers. Example: 'djtarabass@gmail.com, p.rietveld@live.com',
			subject: body.subject,
			content: body.content,
			attachments: files.attachment,
			priority: body.priority,
			callback: function(error, info) {
				if(!error) {
					req.flash('info', 'Email sent');
				}
				else {
					console.log(error);
					req.flash('error', 'Email delivery failed');
				}

				deleteAttachments(attachments);
				res.redirect('back');
			}
		});
	});

/*
 * https://github.com/nodemailer/nodemailer
 *
 * http://stackoverflow.com/a/1461224/408487 => figure out smtp host
 * http://stackoverflow.com/a/20100521/408487 => fix for: { [Error: unable to verify the first certificate] code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' }
 *
 * 'smtps://admin:rietveld79@peterrietveld.nl:465'
 * 'smtps://djtarabass@gmail.com:rietveld79@smtp.gmail.com'
 */
function sendMail(options) {
	options = options || {};
	// fix for: { [Error: unable to verify the first certificate] code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' }
	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	var nodemailer = require('nodemailer'),
		smtpConfig = readFile('./config/smtp.config', false),
		transporter = nodemailer.createTransport(smtpConfig),
		from = options.from,
		to = options.to,
		subject = options.subject,
		content = options.content,
		callback = options.callback,
		mailOptions = {
			from: from,
			to: to,
			subject: subject, // Subject line
			text: content, // plaintext body
			html: '<b>' + content + '</b>', // html body
			attachments: options.attachments,
			priority: options.priority || 'normal'
		};

	if(callback && typeof callback === 'function') {
		transporter.sendMail(mailOptions, callback);
	}
	else {
		console.log('Error: %', 'Callback required');
	}
}

function deleteAttachments(attachments) {
	if(attachments && attachments.length > 0) {
		attachments.forEach(function(file) {
			deleteFile(file.path);
		});
	}
}

function deleteFile(filePath) {
	var fs = require('fs');

	fs.exists(filePath, function(exists) {
		if(exists) {
			fs.unlink(filePath);
		}
		else {
			console.log('File not found, so not deleting.');
		}
	});
}

router.route('/settings')
	.get(function(req, res) {
		var filePath = './config/smtp.config',
			smtpConfig;

		try {
			smtpConfig = readFile(filePath, false);
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

				writeFile(filePath, smtpConfig, false);
			}
		}

		res.render('settings', {
			title: 'SMTP Settings',
			smtpConfig: smtpConfig
		});
	})
	.post(upload, function(req, res) {
		var body = req.body,
			smtpConfig = {
				host: body.host,
				port: body.port,
				secure: body.secure === 'true', // use SSL
				auth: {
					user: body.user,
					pass: body.pass
				}
			};

		try {
			writeFile('./config/smtp.config', smtpConfig);
			req.flash('info', 'SMTP Settings saved');
		}
		catch(e) {
			if(e) {
				req.flash('error', e.message);
			}
		}

		res.redirect('settings');
	});

function readFile(filePath, async) {
	var jsonfile = require('jsonfile'),
		async = async === false ? false : true;

	if(async) {
		jsonfile.readFile(filePath, function(err, obj) {
			if(err) {
				return console.log(err);
			}

			return obj;
		});
	}
	else {
		// TODO: throws is not working. Issue is reported on github
		return jsonfile.readFileSync(filePath/*, { 'throws': false }*/);
	}
}

function writeFile(filePath, content, async) {
	var jsonfile = require('jsonfile');

	if(async) {
		jsonfile.writeFile(filePath, content, { spaces: 4 }, function(err) {
			if(err) {
				return console.log(err);
			}
		});
	}
	else {
		jsonfile.writeFileSync(filePath, content);
	}
}

module.exports = router;
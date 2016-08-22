var express = require('express');
var router = express.Router();
var multer = require('multer');

/* GET home page. */
router.route('/')
	.get(function(req, res) {
		res.render('index', {
			title: 'Send mail'/*,
			messages: req.flash('info')*/
		});
	});

var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './uploads');
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});
var upload = multer({ storage : storage}).fields([{ name: 'attachment', maxCount: 1 }]);

router.route('/sendmail')
	.post(upload, function(req, res) {
		var body = req.body,
			from = body.from, // sender address. Example: '"DJ Tarabass" <djtarabass@gmail.com>'
			to = body.to, // list of receivers. Example: 'djtarabass@gmail.com, p.rietveld@live.com'
			subject = body.subject,
			content = body.content,
			files = req.files,
			attachments = files.attachment,
			priority = body.priority;

		if(attachments && attachments.length > 0) {
			attachments = attachments.map(function(file) {
				return {
					path: './uploads/' + file.filename,
					filename: file.originalname
				};
			});
		}

		sendMail({
			from: from,
			to: to,
			subject: subject,
			content: content,
			attachments: attachments,
			priority: priority,
			callback: function(error, info) {
				if(!error) {
					req.flash("info", "Email sent");
				}
				else {
					console.log(error);
					req.flash("error", "Email delivery failed");
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
		smtpConfig = {
			host: 'peterrietveld.nl',
			port: 465,
			secure: true, // use SSL
			auth: {
				user: 'admin',
				pass: 'rietveld79'
			}
		},
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
			html: '<b>'+content+'</b>', // html body
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
			//Show in green
			console.log('File exists. Deleting now ...');
			fs.unlink(filePath);
		} else {
			//Show in red
			console.log('File not found, so not deleting.');
		}
	});
}

module.exports = router;
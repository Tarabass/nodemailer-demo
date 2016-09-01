var express = require('express');
var router = express.Router();
var multer = require('multer');

var mailUtil = require('../util/mail');

/* GET home page. */
router.route('/')
	.get(function(req, res) {
		res.render('index', {
			title: 'Send mail'
		});
	});

/**
 * https://github.com/expressjs/multer
 * https://codeforgeek.com/2014/11/file-uploads-using-node-js/
 */
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

		mailUtil.sendMail({
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

				mailUtil.deleteAttachments(attachments);
				res.redirect('back');
			}
		});
	});

router.route('/settings')
	.get(function(req, res) {
		var smtpConfig = mailUtil.readSmtpConfig();

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

		mailUtil.writeSmtpConfig(smtpConfig, function(err, result) {
			if(result) {
				req.flash('info', result.message);
			}
			else if(err) {
				req.flash('error', err.message);
			}
		});

		res.redirect('settings');
	});

module.exports = router;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.route('/')
	.get(function(req, res) {
		res.render('index', {
			title: 'Send mail'/*,
			messages: req.flash('info')*/
		});
	});

router.route('/sendmail')
	.post(function(req, res) {
		var body = req.body,
			// from = '"DJ Tarabass" <djtarabass@gmail.com>', // sender address
			from = '"admin" <admin@peterrietveld.nl>',
			to = 'peterrietveld79@gmail.com, p.rietveld@gmail.com', // list of receivers
			subject = body.subject,
			content = body.content;

		sendMail({
			from: from,
			to: to,
			subject: subject,
			content: content,
			callback: function(error, info){
				if(!error) {
					req.flash("info", "Email queued");
					req.flash("info", "Email sent");
				}
				else {
					console.log(error);
					req.flash("error", "Email delivery failed");
				}

				res.redirect('back');
			}
		});
	});

function sendMail(options) {
	options = options || {};
	var nodemailer = require('nodemailer'),
		transporter = nodemailer.createTransport('smtps://admin@peterrietveld.nl:rietveld79@smtp.peterrietveld.nl:465'),
		// transporter = nodemailer.createTransport('smtps://admin@peterrietveld.nl:rietveld79@smtp.86.85.163.250:465'),
		
		// transporter = nodemailer.createTransport('smtps://djtarabass@gmail.com:rietveld79@smtp.gmail.com'),
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
			html: '<b>'+content+'</b>' // html body
		};

	if(callback && typeof callback === 'function') {
		// send mail with defined transport object
		transporter.sendMail(mailOptions, callback);
	}
	else {
		console.log('Error: %', 'Callback required');
	}
}

module.exports = router;

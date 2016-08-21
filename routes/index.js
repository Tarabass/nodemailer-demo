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
			from = body.from, // sender address. Example: '"DJ Tarabass" <djtarabass@gmail.com>'
			to = body.to, // list of receivers. Example: 'djtarabass@gmail.com, p.rietveld@live.com'
			subject = body.subject,
			content = body.content;

		sendMail({
			from: from,
			to: to,
			subject: subject,
			content: content,
			callback: function(error, info){
				if(!error) {
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

/*
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
		transporter = nodemailer.createTransport('smtps://admin:rietveld79@peterrietveld.nl:465'),
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
		transporter.sendMail(mailOptions, callback);
	}
	else {
		console.log('Error: %', 'Callback required');
	}
}

module.exports = router;
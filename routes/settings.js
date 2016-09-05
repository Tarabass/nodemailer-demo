/**
 * Created by Peter Rietveld (p.rietveld@live.com) on 05-Sep-16.
 *
 * Any use of the code written here-in belongs to the developer and is
 * hereby the owner. If used, one must have strict approval by the
 * developer of the code written here-in. The developer may at anytime
 * change, modify, add, or delete any content contained within.
 *
 * Copyright (c) 2016 Strictly Internet
 */
var express = require('express');
var router = express.Router();

var mailUtil = require('../util/mail');

router.route('/')
	.get(function(req, res) {
		var smtpConfig = mailUtil.readSmtpConfig();

		res.render('settings', {
			title: 'SMTP Settings',
			smtpConfig: smtpConfig
		});
	})
	.post(function(req, res) {
		var body = req.body,
			smtpConfig = {
				description: body.description,
				host: body.host,
				port: body.port,
				secure: body.secure === 'true', // use SSL
				auth: {
					user: body.user,
					pass: body.pass
				},
				identity: {
					name: body.name,
					address: body.address
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
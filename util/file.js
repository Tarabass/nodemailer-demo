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
var jsonfile = require('jsonfile');

module.exports = function() {
	return {
		readFile: function(filePath, async) {
			var async = async === false ? false : true;

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
		},

		writeFile: function(filePath, content, async) {
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
		},

		deleteFile: function(filePath) {
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
	};
}();
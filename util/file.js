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
const fs = require('fs')
const jsonfile = require('jsonfile')

module.exports = function() {
	return {
		readJsonFile: function(filePath, async) {
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

		writeJsonFile: function(filePath, content, async) {
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
			// var fs = require('fs');

			fs.exists(filePath, function(exists) {
				if(exists)
					fs.unlink(filePath, function(err) {
						if (err) throw err;

						console.log(filePath + ' was deleted');
					})
				else
					console.log('File not found, so not deleting.')
			})
		},

		readDir: function(dir, options) {
			options = options || {}
			
			fs.readdir(dir, (err, files) => {
				if (err) return console.log(err)

				const result = files.map((v) => {
						return {
							filename: v,
							stats: options.stats ? fs.statSync(dir + '/' + v) : null
						}
					}),
					orderBy = options.orderBy || 'date',
					orderDir = options.orderDir || 'asc'

				switch(orderBy) {
					case 'filename':
						result.sort((a, b) => {
							return orderDir === 'asc' ? a.filename.localeCompare(b.filename) : b.filename.localeCompare(a.filename)
						})
					break
					case 'size':
						result.sort((a, b) => {
							return orderDir === 'asc' ? a.stats.size - b.stats.size : b.stats.size - a.stats.size
						})
					break
					case 'date':
						result.sort((a, b) => {
							const aTime = a.stats.mtime.getTime(),
								bTime = b.stats.mtime.getTime()

							return orderDir === 'asc' ? aTime - bTime : bTime - aTime
						})
					break
				}

				if(options.callback && typeof options.callback === 'function') {	
					options.callback(err, result)
				}
			})
		},

		readFile: function(filePath, filename) {
			options = options || {}
			fs.readFile(filePath + '/' + filename, {
				encoding: options.encoding || 'utf-8'
			},
			function(err, data) {
				if (err) console.log(err)

				return data
			})
		},

		readLines: function(options, callback) {
			options = options || {}
			var filePath = options.filePath,
				filename = options.filename,
				lines = []

			try {
				if(!filePath || !filename) {
					throw new Error('Required')
				}
				else if(!callback || typeof callback !== 'function') {
					throw new Error('Callback is required and must be a function')
				}
				else {
					const readline = require('readline')
					const lineReader = readline.createInterface({
						input: fs.createReadStream(filePath + '/' + filename),
						crlfDelay: Infinity
					})

					lineReader.on('line', (line) => {
						lines.push(line)
					}).on('close', () => {
						callback(lines)
					})
				}
			}
			catch(e) {
				console.log(e)
			}
		}
	};
}();
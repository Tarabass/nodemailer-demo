/**
 * Created by Peter Rietveld (p.rietveld@live.com) on 25-Sep-18.
 *
 * Any use of the code written here-in belongs to the developer and is
 * hereby the owner. If used, one must have strict approval by the
 * developer of the code written here-in. The developer may at anytime
 * change, modify, add, or delete any content contained within.
 *
 * Copyright (c) 2018 Strictly Internet
 */
const express = require('express')
const router = express.Router()
const fileUtil = require('../util/file')

router.route('/')
    .get(function(req, res) {
        var dir = './logfiles'

        var query = req.query

        if(query && query.filename) {
            const filename = query.filename//.params.filename
            
            fileUtil.readLines({
                filePath: './logfiles',
                filename: filename
            },
            function(lines) {
                res.render('log', {
                    title: 'log',
                    lines: lines
                })
            })
        }
        else {
            fileUtil.readDir(dir, {
                stats: true,
                orderBy: query.orderby,
                orderDir: query.orderdir,
                callback: function(err, files) {
                    if(err) console.log(err)
                    
                    res.render('logs', {
                        title: 'Logs',
                        logs: files
                    })
                }
            })
        }
    })

router.route('/:filename')
    .get(function(req, res) {
        const filename = req.params.filename

        const fs = require('fs')
        const readline = require('readline')

        // fs.readFile('./logfiles/' + filename, { encoding: 'utf-8' }, function(err, data) {
        //     if (err) console.log(err)

        //     res.render('log', {
        //         title: 'log',
        //         content: data
        //     })
        // })

        var lineReader = readline.createInterface({
            input: fs.createReadStream('./logfiles/' + filename),
            crlfDelay: Infinity
        })
        var lines = []
        lineReader.on('line', function (line) {
            console.log('Line from file:', line);
            lines.push(line)
        })

        lineReader.on('close', function() {
            res.render('log', {
                title: 'log',
                lines: lines
            })
        })
    })

module.exports = router
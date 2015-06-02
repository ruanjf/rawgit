"use strict";

var config = require('../../conf');
var path   = require('path');

// Redirects requests for non-whitelisted file extensions directly to GitHub,
// since there's no value in proxying them.
module.exports = function (rootUrl) {
    var REGEX_GITLAB_REPO_URL = /^(.+?\/.+?)\/(?:blob|raw)\/(.+)/i;
    return function (req, res, next) {
        if (req.isCDN) {
            return void next();
        }

        if (config.extensionWhitelist[path.extname(req.path).toLowerCase()]) {
            return void next();
        }

        var rUrl = rootUrl;
        var url = req.url;
        if (REGEX_GITLAB_REPO_URL.test(req.path)) {
            rUrl = 'http://' + config.gitlabRepo;
            url = url.replace(REGEX_GITLAB_REPO_URL, '$1/raw/$2');
        }

        res.setHeader('Cache-Control', 'max-age=2592000'); // 30 days
        res.redirect(301, rUrl + url);
    };
};

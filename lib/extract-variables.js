'use strict';

var path = require('path');

var _ = require('lodash');
var through = require('through2');
var multimatch = require('multimatch');
var gutil = require('gulp-util');

var util = require('./util');

module.exports = function(opts) {
  opts = _.assign({
    sections: util.DefaultSections,
    ext: util.DefaultExt
  }, opts || {});

  var globs = opts.sections.map(function(sec) {
    return util.getSecGlob(sec, opts);
  });

  return through.obj(function(f, enc, cb) {
    if (multimatch(f.path, globs).length !== 0) {
      var contents = f.contents.toString();
      var pattern = /(\$\S+:\s+\S+\s+!default;?)/g;
      var matches = contents.match(pattern);

      if (matches && matches.length) {
        // TODO: should we remove the '!default'?
        // some default (e.g. $inuit-responsive-settings) has meaning
        //matches.map(function(m) {return m.replace(/\s+!default/, '').replace(/\s+/, ' ');});
        var vars = matches.join('\n');

        this.push(new gutil.File({
          path: path.resolve(util.getCustomizedPath(f.path)),
          contents: new Buffer(vars)
        }));
      }
    }
    cb();
  });
};

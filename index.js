'use strict';

var path = require('path');
var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var inject = require('gulp-inject');

module.exports = function(fileStream, opts) {
  opts = _.assign({
    sections: [
      'customize',
      'settings',
      'tools',
      'generic',
      'base',
      'objects',
      'components',
      'trumps'
    ],
    starttag: '//= {{name}}:{{ext}}',
    endtag: '//= endinject',
    ext: 'scss'
  }, opts || {});

  var skeleton = _.map(opts.sections, function(sec) {
    var placeholderTemplate = [opts.starttag, opts.endtag].join('\n');
    return _.template(placeholderTemplate, {
      name: sec,
      ext: opts.ext
    }, {
      interpolate: /{{([\s\S]+?)}}/g
    });
  }).join('\n\n');

  var injectOpts = {
    starttag: opts.starttag,
    endtag: opts.endtag,
    transform: function(filepath, file, index, length, targetFile) {
      var ext;
      if (targetFile && targetFile.path) {
        ext = path.extname(targetFile.path).slice(1);
        ext = ext.toLowerCase();
      }
      if (ext === opts.ext) {
        return '@import \'' + file.path + '\';';
      }
    }
  };

  var stream = through.obj();

  stream.write(new gutil.File({
    path: path.resolve('index.' + opts.ext),
    contents: new Buffer(skeleton)
  }));
  stream.end();

  if (fileStream) {
    _.map(opts.sections, function(sec) {
      var secFilter = filter('**/?(_)' + sec + '.*.' + opts.ext);
      stream = stream.pipe(inject(fileStream.pipe(secFilter), _.assign({
        name: sec
      }, injectOpts)));
    });
  }

  return stream;
};

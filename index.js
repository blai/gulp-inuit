'use strict';

var path = require('path');
var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var inject = require('gulp-inject');

var others = 'others';

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
    ext: 'scss',
    name: 'index'
  }, opts || {});

  var skeleton = _.map(opts.sections.concat(others), function(sec) {
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
    path: path.resolve(opts.name + '.' + opts.ext),
    contents: new Buffer(skeleton)
  }));
  stream.end();

  if (fileStream) {
  	var globForRest = ['**/*.' + opts.ext];
    _.map(opts.sections, function(sec) {
    	var glob = '**/?(_)' + sec + '.*.' + opts.ext;
      var secFilter = filter(glob);
      globForRest.push('!' + glob);
      stream = stream.pipe(inject(fileStream.pipe(secFilter), _.assign({
        name: sec
      }, injectOpts)));
    });

    stream = stream.pipe(inject(fileStream.pipe(filter(globForRest)), _.assign({
    	name: others
    }, injectOpts)));
  }

  return stream;
};

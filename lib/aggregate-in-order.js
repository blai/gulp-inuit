'use strict';

var EventEmitter = require('events').EventEmitter;
var path = require('path');

var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var inject = require('gulp-inject');

var util = require('./util');

module.exports = function(fileStream, opts) {
  opts = _.assign({
    sections: util.DefaultSections,
    starttag: '//= {{name}}:{{ext}}',
    endtag: '//= endinject',
    ext: util.DefaultExt,
    name: 'index'
  }, opts || {});

  var skeleton = _.reduce(opts.sections.concat(util.Others), function(all, sec) {
    var customizedSec = util.getCustomizedName(sec);
    all.push(util.getPlaceholder(customizedSec, opts));
    all.push(util.getPlaceholder(sec, opts));

    return all;
  }, []).join('\n\n');

  var injectOpts = {
    starttag: opts.starttag,
    endtag: opts.endtag,
    transform: util.injectTransform(opts)
  };

  var stream = through.obj();

  stream.write(new gutil.File({
    path: path.resolve(opts.name + '.' + opts.ext),
    contents: new Buffer(skeleton)
  }));
  stream.end();

  if (fileStream) {
    // gulp-inject is putting a listener on 'end' on ever 'pipe()',
    // and we are doing a lot of them here to cause a warning.
    // boosting the limit to account for just that many more we will need here.
    fileStream.setMaxListeners(EventEmitter.listenerCount(fileStream, 'end') + opts.sections.length * 2 + 1);

    var globForRest = ['**/*.' + opts.ext];
    _.map(opts.sections, function(sec) {
      var glob, secFilter;
      var customizedSec = util.getCustomizedName(sec);

      glob = util.getSecGlob(customizedSec, opts);
      secFilter = filter(glob);
      globForRest.push('!' + glob);
      stream = stream.pipe(inject(fileStream.pipe(secFilter), _.assign({
        name: customizedSec
      }, injectOpts)));

      glob = util.getSecGlob(sec, opts);
      secFilter = filter(glob);
      globForRest.push('!' + glob);
      stream = stream.pipe(inject(fileStream.pipe(secFilter), _.assign({
        name: sec
      }, injectOpts)));
    });

    stream = stream.pipe(inject(fileStream.pipe(filter(globForRest)), _.assign({
      name: util.Others
    }, injectOpts)));
  }

  return stream;
};

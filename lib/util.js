'use strict';

var assert = require('assert');
var path = require('path');
var _ = require('lodash');

var mustacheStyleTemplateSettings = {
  interpolate: /{{([\s\S]+?)}}/g
};

exports.Others = 'others';

exports.DefaultSections = [
  'settings',
  'tools',
  'generic',
  'base',
  'objects',
  'components',
  'trumps'
];

exports.DefaultExt = 'scss';

exports.getCustomizedName = function(name) {
  assert(name && name.length, 'Cannot customize name that is not defined or empty.');
  return 'customize.' + name;
};

exports.getCustomizedPath = function(name) {
  assert(name && name.length, 'Cannot customize path that is not defined or empty.');
  var base = path.basename(name);
  base = base.charAt(0) === '_' ? base.substr(1) : base;
  return '_' + this.getCustomizedName(base);
};

exports.getPlaceholder = function(name, opts) {
  assert(name && name.length, 'Cannot create placeholder without name.');
  var placeholderTemplate = [opts.starttag, opts.endtag].join('\n');
  return _.template(placeholderTemplate, {
    name: name,
    ext: opts.ext
  }, mustacheStyleTemplateSettings);
};

exports.getSecGlob = function(sec, opts) {
  return '**/?(_)' + sec + '.*.' + opts.ext;
};

exports.injectTransform = function(opts) {
  return function(filepath, file, index, length, targetFile) {
    var ext;
    if (targetFile && targetFile.path) {
      ext = path.extname(targetFile.path).slice(1);
      ext = ext.toLowerCase();
      if (ext === opts.ext) {
        return '@import \'' + file.path + '\';';
      }
    }
  };
};

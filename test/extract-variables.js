'use strict';

var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var through = require('through2');
var should = require('should');
var mocha = require('mocha');
var gutil = require('gulp-util');
var variables = require('../lib/extract-variables');

var util = require('../lib/util');

var base = path.resolve('test');

function filesToVinylStream(files) {
  var stream = through.obj();
  _.each(files, function(f) {
    var p = path.resolve(base, f);
    stream.write(new gutil.File({
      path: p,
      base: base,
      contents: fs.readFileSync(p)
    }));
  });
  stream.end();

  return stream;
}

function expectedFile(file) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures', file), 'utf8');
}

var inputs = [
  'fixtures/_base.headings.scss',
  'fixtures/_generic.box-sizing.scss',
  'fixtures/_objects.box.scss',
  'fixtures/_settings.defaults.scss',
  'fixtures/_tools.functions.scss',
  'fixtures/_tools.mixins.scss',
  'fixtures/_trumps.spacing.scss',
  'fixtures/other.scss'
];

describe('Variable extraction: invalid inputs', function() {
  it('should emit error when vinyl.isNull()', function(done) {
    var stream = through.obj();
    _.each(inputs, function(f) {
      var p = path.resolve(base, f);
      stream.write(new gutil.File({
        path: p,
        base: base
      }));
    });
    stream.end();

    stream.pipe(variables())
      .on('error', function(err) {
        err.message.should.eql('Requires file content to process variable extraction.');
        done();
      });
  });

  it('should emit error on streamed file', function(done) {
    var stream = through.obj();
    _.each(inputs, function(f) {
      var p = path.resolve(base, f);
      stream.write(new gutil.File({
        path: p,
        base: base,
        contents: fs.createReadStream(p)
      }));
    });
    stream.end();

    stream.pipe(variables())
      .on('error', function(err) {
        err.message.should.eql('Stream is not supported.');
        done();
      });
  });
});

describe('Variables extraction: function', function() {

  var outputs = [];

  before(function(done) {
    var fileStream = filesToVinylStream(inputs)
      .pipe(variables())
      .pipe(through.obj(function(f, enc, cb) {
        outputs.push(f);
        cb();
      }, function(cb) {
        done();
        cb();
      }));
  });

  it('should extract variables from known sections', function() {
    [
      '_customize.base.headings.scss',
      '_customize.objects.box.scss',
      '_customize.settings.defaults.scss',
      '_customize.trumps.spacing.scss'
    ].forEach(function(c) {
      var found = _.find(outputs, function(f) {
        return f.path === path.resolve(c);
      });

      (undefined !== found).should.be.true;
    });
  });

  it('should ingore variables from non-inuit section files', function() {
    var found = _.find(outputs, function(f) {
      return f.path === path.resolve('_customize.other.scss');
    });

    (undefined === found).should.be.true;
  });

  it('should extract variables with !default, as-is', function() {
    outputs.forEach(function(o) {
      var expected = expectedFile(path.basename(o.path));
      o.contents.toString().should.eql(expected);
    });
  });
});

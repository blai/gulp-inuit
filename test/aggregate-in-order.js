'use strict';

var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var through = require('through2');
var should = require('should');
var mocha = require('mocha');
var gutil = require('gulp-util');
var aggregate = require('../lib/aggregate-in-order');

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
  var f = fs.readFileSync(path.resolve(__dirname, 'expects', file));
  return _.template(f, {
    base: base
  });
}

describe('Empty cases', function() {
  it('should produce index.scss vinyl with just comments', function(done) {
    var stream = aggregate();
    var expected = expectedFile('1.scss');

    stream.on('error', function(err) {
      should.exist(err);
      console.log(err);
      done(err);
    });

    stream.on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);

      (newFile.contents + '\n').should.equal(expected);
      done();
    });
  });
});

describe('Module sorting', function() {
  var files = [
    'fixtures/_base.headings.scss',
    'fixtures/_objects.box.scss',
    'fixtures/_generic.box-sizing.scss',
    'fixtures/_settings.defaults.scss',
    'fixtures/_tools.functions.scss',
    'fixtures/_tools.mixins.scss',
    'fixtures/_trumps.spacing.scss'
  ];

  it('should sort default inuit sections in order', function(done) {
    var expected = expectedFile('2.scss');

    var fileStream = filesToVinylStream(files);
    var stream = aggregate(fileStream);

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function(newFile) {
      should.exist(newFile);
      newFile.path.should.equal(path.resolve('index.scss'));
      should.exist(newFile.contents);

      (newFile.contents + '\n').should.equal(expected);
      done();
    });
  });

  it('should add any unrecognized section to the end', function(done) {
    var filesWithOthers = files.concat('fixtures/other.scss');
    var expected = expectedFile('3.scss');

    var fileStream = filesToVinylStream(filesWithOthers);
    var stream = aggregate(fileStream);

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function(newFile) {
      should.exist(newFile);
      newFile.path.should.equal(path.resolve('index.scss'));
      should.exist(newFile.contents);

      (newFile.contents + '\n').should.equal(expected);
      done();
    });
  });

  it('should add customize files before their according sections', function(done) {
    var filesWithCustomization = files.concat([
      'fixtures/_customize.settings.defaults.scss',
      'fixtures/_customize.base.headings.scss'
    ]);
    var expected = expectedFile('4.scss');

    var fileStream = filesToVinylStream(filesWithCustomization);
    var stream = aggregate(fileStream);

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function(newFile) {
      should.exist(newFile);
      newFile.path.should.equal(path.resolve('index.scss'));
      should.exist(newFile.contents);

      (newFile.contents + '\n').should.equal(expected);
      done();
    });
  });
});

describe('Options', function() {
  it('should be able to customize `name` for the output vinyl object', function(done) {
    var name = 'main';
    var stream = aggregate(filesToVinylStream([]), {
      name: name
    });

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function(newFile) {
      should.exist(newFile);
      newFile.path.should.equal(path.resolve(name + '.scss'));
      done();
    });
  });
});

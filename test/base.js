/*global describe, it*/
'use strict';

var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var through = require('through2');
var should = require('should');
var mocha = require('mocha');
var gutil = require('gulp-util');
var inuit = require('../');

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
  it('should produce index.scss vinyl with just comments', function (done) {
  	var stream = inuit();
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
	  'bower_components/inuit-box-sizing/_generic.box-sizing.scss',
	  'bower_components/inuit-defaults/_settings.defaults.scss',
	  'bower_components/inuit-functions/_tools.functions.scss',
	  'bower_components/inuit-mixins/_tools.mixins.scss',
	  'bower_components/inuit-normalize/_generic.normalize.scss',
	  'bower_components/inuit-page/_base.page.scss'
	];

  it('should sort default inuit sections in order', function(done) {
    var expected = expectedFile('2.scss');

    var fileStream = filesToVinylStream(files);
    var stream = inuit(fileStream);

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

  it('should add any unrecognized section to the end', function (done) {
  	var filesWithLocal = files.concat('local/other.scss');
    var expected = expectedFile('3.scss');

    var fileStream = filesToVinylStream(filesWithLocal);
    var stream = inuit(fileStream);

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

describe('Options', function () {
	it('should be able to customize `name` for the output vinyl object', function (done) {
		var name = 'main';
		var stream = inuit(filesToVinylStream([]), {
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

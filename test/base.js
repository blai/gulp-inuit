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

describe('empty list of files', function() {
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

describe('basic case with Inuit default modules', function() {
  it('should produce index.scss vinyl with modules sorted in inuit order', function(done) {
    var files = [
      'modules/inuit-box-sizing/_generic.box-sizing.scss',
      'modules/inuit-defaults/_settings.defaults.scss',
      'modules/inuit-functions/_tools.functions.scss',
      'modules/inuit-mixins/_tools.mixins.scss',
      'modules/inuit-normalize/_generic.normalize.scss',
      'modules/inuit-page/_base.page.scss'
    ];

    var expected = expectedFile('2.scss');

    var fileStream = filesToVinylStream(files);
    var stream = inuit(fileStream);

    stream.on('error', function(err) {
      should.exist(err);
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

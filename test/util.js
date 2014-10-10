/*global describe, it*/
'use strict';

var should = require('should');
var mocha = require('mocha');
var util = require('../lib/util');

describe('util', function() {

  describe('getCustomizedName()', function() {
    it('should prepend customize.', function() {
      util.getCustomizedName('foo').should.eql('customize.foo');
    });

    it('should throw exception if name is undefined or empty', function() {
      util.getCustomizedName.bind(null).should.throw();
      util.getCustomizedName.bind(null, null).should.throw();
      util.getCustomizedName.bind(null, '').should.throw();
    });
  });

  describe('getCustomizedPath', function() {
    it('should handle file name starting with _', function() {
      util.getCustomizedPath('/foo/_bar.scss').should.eql('_customize.bar.scss');
    });

    it('should handle file name without leading _', function() {
      util.getCustomizedPath('/foo/bar.scss').should.eql('_customize.bar.scss');
    });

    it('should throw exception if path is undefined or empty', function() {
      util.getCustomizedPath.bind(null).should.throw();
      util.getCustomizedPath.bind(null, null).should.throw();
      util.getCustomizedPath.bind(null, '').should.throw();
    });
  });

  describe('getPlaceholder()', function() {
    var opts = {
        starttag: '// {{name}}:{{ext}}',
        endtag: '// end',
        ext: 'scss'
      };

    it('should handle opts.starttag and opts.endtag as mustache template partials', function() {
      util.getPlaceholder('foo', opts).should.eql('// foo:scss\n// end');
    });

    it('should throw exception if name is undefined or empty', function() {
      util.getPlaceholder.bind(null, undefined, opts).should.throw();
      util.getPlaceholder.bind(null, null, opts).should.throw();
      util.getPlaceholder.bind(null, '', opts).should.throw();
    });
  });

  describe('getSecGlob', function() {
    it('should generate glob', function() {
      util.getSecGlob('foo', {
        ext: 'scss'
      }).should.eql('**/?(_)foo.*.scss');
    });
  });

  describe('injectTransform', function() {
      var ignored = null;
    it('should return function that transform when targetFile has a matching fild ext', function() {
      util.injectTransform({
        ext: 'foo'
      })(ignored, {
        path: '/bar'
      }, ignored, ignored, {
        path: '/path/to/file.foo'
      }).should.eql('@import \'/bar\';');
    });

    it('should return function that return null when targetFile a ext that does not match', function () {
      var result = util.injectTransform({
        ext: 'foo'
      })(ignored, {
        path: '/baz'
      }, ignored, ignored, {
        path: '/path/to/file.bar'
      });
      (result === undefined).should.be.true;
    });
  });
});

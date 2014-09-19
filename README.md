# gulp-inuit
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]  [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

> [Inuit](https://github.com/inuitcss/getting-started#import-order) plugin for [gulp](https://github.com/wearefractal/gulp)

One common problem to deal with the new modular approach of [Inuit](https://github.com/inuitcss/getting-started#import-order) Framework is to import the modular sections [in order](https://github.com/inuitcss/getting-started#import-order). This gulp plugin is designed to specifically fill this gap.

Here's how it works:

1. You feed `gulp-inuit` with a vinyl stream, just like any other gulp plugins. The easiest way to do so is to use [main-bower-files](https://github.com/ck86/main-bower-files).
2. You then pipe the output of `gulp-inuit` to the sass compiler.

## Usage

First, install `gulp-inuit` as a development dependency:

```shell
npm install --save-dev gulp-inuit
```

Then, add it to your `gulpfile.js`:

```javascript
var sass = require('gulp-sass');
var mainBowerFiles = require('main-bower-files');
var inuit = require("gulp-inuit");

// it is not necessary to read in the content
var sassFileStream = gulp.src(mainBowerFiles(), {read: false})
	.pipe(gulp.src('**/*.scss', {read: false}));

inuit(sassFileStream)
	.pipe(sass())
	.pipe(gulp.dest("./dist"));
```

## API

### inuit(fileStream, options)

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

#### options.sections
Type: `Array`  
Default: `[
  'customize',
  'settings',
  'tools',
  'generic',
  'base',
  'objects',
  'components',
  'trumps'
]`

The array of section names, in their expected import order. The default values is as documented on [Inuit's getting started guide](https://github.com/inuitcss/getting-started#import-order), plus the `customize` type added in front, allowing you to introduce local files that defines customization to the variables of Inuit framework.

#### options.starttag
Type: `String`
Default: `//= {{name}}:{{ext}}`

`gulp-inuit` uses [gulp-inject](https://github.com/klei/gulp-inject) internally to create a centralized `index.scss` file that imports all modular `.scss` files in order. This option is in fact the [starttag](https://github.com/klei/gulp-inject#optionsstarttag) option from that plugin.

#### options.endtag
Type: `String`
Default: `//= endinject`

Same reason as `options.starttag`, this is simply [endtag](https://github.com/klei/gulp-inject#optionsendtag) option from `gulp-inject`.

#### options.ext
Type: `String`
Default: `scss`

Inuit uses `.scss` syntax, this option allows the plugin to work with any potential porting to other css preprocessing languages.


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-inuit
[npm-image]: https://badge.fury.io/js/gulp-inuit.png

[travis-url]: http://travis-ci.org/blai/gulp-inuit
[travis-image]: https://secure.travis-ci.org/blai/gulp-inuit.png?branch=master

[coveralls-url]: https://coveralls.io/r/blai/gulp-inuit
[coveralls-image]: https://coveralls.io/repos/blai/gulp-inuit/badge.png

[depstat-url]: https://david-dm.org/blai/gulp-inuit
[depstat-image]: https://david-dm.org/blai/gulp-inuit.png

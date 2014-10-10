# gulp-inuit
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

> [Inuit](https://github.com/inuitcss/getting-started) plugin for [gulp](https://github.com/wearefractal/gulp)

There are a few common problem we want to solve when developing custom [Inuit](https://github.com/inuitcss/getting-started) themes using its new modular approach with [Bower](http://bower.io/).

* Import the modular sections [in order](https://github.com/inuitcss/getting-started#import-order): you would usually need to maintain an `index.scss` that imports all the `.scss` files from your bower modules, like it is [recommended](https://github.com/inuitcss/getting-started#modifying-inuitcss)
* Customizing variables defined by all those modules you are depending on.

These common problems (and common solutions) are not only tedious, but also problem-prone (think: copying a new variable for customization after upgrading an Inuit module). This gulp plugin is designed to specifically fill these gaps.

## How it works:

1. The primary function of `gulp-inuit` takes a vinyl stream and generate a virtual `index.scss` on the fly, importing all `.scss` files from all bower dependencies, [in order](https://github.com/inuitcss/getting-started#import-order). You can then pipe it to `gulp-sass` to get your css output. Simply put, you would never need to manually maintain a `index.scss` any more.
2. The secondary function of `gulp-inuit` (exported as `variables`) will take a vinyl stream and translate that into a stream of files ([vinyl](https://github.com/wearefractal/vinyl) objects) with the variables extracted from those in the original stream.

> [Try it out: **gulp-inuit-example**](https://github.com/blai/gulp-inuit-example)

## Usage

First, install `gulp-inuit` as a development dependency:

```shell
npm install --save-dev gulp-inuit
```

## API

> Primary usage

### *inuit ( fileStream [, options ] )*

```javascript
var sass = require('gulp-sass');
var mainBowerFiles = require('main-bower-files');
var inuit = require("gulp-inuit");

// it is not necessary to read in the content
var sassFileStream = gulp.src(mainBowerFiles().concat('**/*.scss'), {read: false});

inuit(sassFileStream)
  .pipe(sass())
  .pipe(gulp.dest("./dist"));
```

#### options.name
Type: `String`  
Default: `index`

The file name of the resulting vinyl object.

```
var sassFileStream = gulp.src(mainBowerFiles().concat('**/*.scss'), {read: false});

// this will generate a file './dist/main.css', instead of './dist/index.css'
inuit(sassFileStream, { name: 'main' })
  .pipe(sass())
  .pipe(gulp.dest("./dist"));

```

#### options.sections
Type: `Array`  
Default: `[
  'settings',
  'tools',
  'generic',
  'base',
  'objects',
  'components',
  'trumps'
]`

The array of section names, in their expected import order. The default values is as documented on [Inuit's getting started guide](https://github.com/inuitcss/getting-started#import-order).

> You may never have to change any of the following options.

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

---

> Secondary usage

### *inuit.variables ( [ options ] )*

```javascript
var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var conflict = require('gulp-conflit');
var inuit = require("gulp-inuit");

gulp.task('customize-variales', function () {
  // you must NOT set { read: faslse }, the plugin needs to read into the content for variable extraction.
  return gulp.src(mainBowerFiles())
    .pipe(inuit.variables())
    .pipe(conflict('./app/styles/customize'))
    .pipe(gulp.dest('./app/styles/customize'));
});
```

You can run this gulp task every time when you add/remove/update your bower dependencies. The task will generate a list of `.scss` files that captures the variables declared in those bower packages, and put the files in `app/styles/customize` directory. The `conflict()` gulp plugin shown in example should help you navigate through the changes before you apply them.

#### options.sections
Type: `Array`  
Default: `[
  'settings',
  'tools',
  'generic',
  'base',
  'objects',
  'components',
  'trumps'
]`

The array of section names, in their expected import order. The default values is as documented on [Inuit's getting started guide](https://github.com/inuitcss/getting-started#import-order). Only files with a name that follows the inuit file naming convention would be processed for variable extraction.

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

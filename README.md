# jswrap-brunch

Helps you wrap `.js` files with custom wrapper code before passing
it through to the rest of the pipeline.

## Installation

### npm

`npm install jswrap-brunch --save-dev`

### yarn

`yarn add --dev jswrap-brunch`

## Usage

Configure by setting the `jsWrap` key in `plugins` in your `brunch-config.js`
file. Its structure is as follows:


```javascript
// brunch-config.js

{
  ...
  plugins: {
    ...
    jsWrap: {
      debug: [Boolean],
      wrappers: [
        {
          match: <Array[RegExp | String] | Regexp | String>,
          wrap: <Function(fileContents: String): String>,
          halt: [Boolean]
        },
      ]
    }
  }
}
```


`wrappers` is an array of objects defining match/wrap rules. Its attributes
are:

* `match`: a string, a regexp, or an array of strings/regexps which will
  be used a filename tester. If any tester matches, the wrap proceeds.
* `wrap`: a function that takes the file contents and returns wrapped file
  contents.
* `halt`: a boolean indicating whether further matches shouldn't be considered
  after this one.

`debug` is a boolean value that will dump a bunch of matching information
to the console if truthy to help you debug problems.


## Motivation

I built this tool while trying to integrate the [Stanford Javascript
Crypto Library](https://github.com/bitwiseshiftleft/sjcl) into my
build pipeline.

The SJCL has its own build process using configuration for inclusion
of given features, makefiles, etc, and doesn't use standard CommonJS or ES6
export functionality. Rather than have compilation be part of my build
pipeline, I decided it would be nicer if I could wrap their files at build time
to create proper JS modules.

### SJCL Example

This is how I used the `jswrap-brunch` plugin to suit my needs of combining and
wrapping the SJCL into a more modern module:

* Install `jswrap-brunch` plugin as `npm install
* Enable it as an npm compiler in `brunch-config.js`:

  ```javascript
  // in brunch-config.js

  npm: {
    compilers: ["jswrap-brunch"],
    ...
  }
  ```

  Note that this used to be under the `plugins.npm` key which is now
  deprecated, despite the [brunch documentation](http://brunch.io/docs/config#-npm-).

* Set up the following rules for the plugin:

  ```javascript
  // in brunch-config.js

  plugins: {
    jsWrap: {
      wrappers: [
        {
          wrap: data => `
            ${data}
            module.exports = sjcl;
          `,
          match: /node_modules\/sjcl\/core\/sjcl\.js$/,
          halt: true
        },
        {
          wrap: data => `
            (function(sjcl) {
            ${data}
            })(require("./sjcl"));
          `,
          match: /node_modules\/sjcl\/core\/.*\.js$/
        }
      ]
    },
    ...
  }
  ```

* Create a manifest javascript file in my project code:

  ```javascript
  // js/sjcl-wrapper.js

  import sjcl from "sjcl/core/sjcl";
  import "sjcl/core/aes"; // side effects on core sjcl module
  import "sjcl/core/cbc";
  // ... etc ...

  export default sjcl;
  ```

* Now you can import and interact with "custom builds" of the SJCL
  without actually engaging with its build pipeline.

## License

MIT, go nuts.

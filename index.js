function matches(matchers, filename) {
  if (!(matchers instanceof Array)) {
    matchers = [matchers];
  }
  for (matcher of matchers) {
    if (matcher instanceof RegExp) {
      return !!filename.match(matcher);
    } else {
      return filename === matcher;
    }
  }
}

function debug(msg) {
  console.log(`[jswrap-brunch] DEBUG: ${msg}`);
}

function die(msg) {
  console.error(`[jswrap-brunch] FATAL: ${msg}`);
  throw new Error(msg);
}

class JsWrapBrunch {
  constructor(config) {
    const pluginConfig = config && config.plugins && config.plugins.jsWrap || {};

    this.wrappers = {};
    Object.assign(this, pluginConfig);

    this.verifyWrappers();
  }

  verifyWrappers() {
    for (let i = 0; i < this.wrappers.length; ++i) {
      const wrapper = this.wrappers[i];
      if (!Object.prototype.hasOwnProperty.call(wrapper, "match")) {
        die(`wrapper at index ${i}: "match" field missing`);
      }
      if (typeof wrapper.wrap !== "function") {
        die(`wrapper at index ${i}: "wrap" not a function, or missing`);
      }
    }
  }

  compile(file) {
    let data = file.data;
    const path = file.path;

    for (const { wrap, match, halt } of this.wrappers) {
      if (this.debug) { debug(`Testing ${path} against ${match}`); }

      if (matches(match, path)) {
        if (this.debug) { debug('Matched, wrapping'); }

        data = wrap(data)
        if (halt) {
          if (this.debug) { debug('Halting'); }

          break;
        }
      } else {
        if (this.debug) { debug('No match'); }
      }
    }

    return Promise.resolve({ data });
  }
}

JsWrapBrunch.prototype.brunchPlugin = true;
JsWrapBrunch.prototype.type = "javascript";
JsWrapBrunch.prototype.extension = ".js";

module.exports = JsWrapBrunch;

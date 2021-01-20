const pkg = require('./package.json');
const requireFromString = require('require-from-string');

function asDefaultExport(output, pluginOptions) {
  const mod = pluginOptions.module || 'esnext';
  if (mod === true || mod.match(/^es/)) {
    return `export default ${JSON.stringify(output)}`;
  } else {
    return `module.exports=${JSON.stringify(output)}`;
  }
}

function evaluate(contents, pluginOptions) {
  try {
    const script = contents.slice(10);
    const output = requireFromString(script);
    return asDefaultExport(output, pluginOptions);
  } catch (err) {
    console.error('encountered error during @preval execution');
    console.error(err);
    return asDefaultExport(pluginOptions.fallback, pluginOptions);
  }
}

function plugin(snowpackConfig, pluginOptions) {
  return {
    name: pkg.name,
    transform({ contents, fileExt }) {
      // only JS files are supported
      if (fileExt !== '.js') return contents;

      // only process files with appropriate header
      if (contents.slice(0, 10) !== '// @preval') return contents;

      // replace contents with evaluated result
      return evaluate(contents, pluginOptions);
    },
  };
}

module.exports = plugin;

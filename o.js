/*global jQuery, _, exports */
(function (exports, $) {
  'use strict';
  var name = 'odotjs',
    extend = _.extend,
    plugins = {},
    addPlugins = function (newPlugins) {
      extend(plugins, newPlugins);
    },
    plugin = function plugin(name, fn) {
      this.fn[name] = fn;
    },
    bless = function bless(fn) {
      fn.plugin = plugin;

      extend(fn, plugins);

      return fn;
    },
    o,
    api,
    defaultInit = function init() {
      return this;
    },

    /**
     * The user can pass in the formal parameters, or a named
     * parameters object in the first argument. Either way,
     * we need to initialize the variables to the expected
     * values.
     * 
     * @param {String} optionNames Parameter names.
     * 
     * @return {object} New configuration object.
     */
    getConfig = function getConfig(optionNames) {
      var config = {}, // New config object
        // Comma separated string to Array
        optionNames = optionNames.split(','),
        // Turn arguments into array, starting at index 1
        args = [].slice.call(arguments, 1);

      optionNames.forEach(function (optionName, index) {
        // Strip whitespace
        optionName = optionName.trim();
        // Use first argument as params object if it exists...
        config[optionName] = args[0][optionName]
          || args[index]; // or grab the formal parameter.
      });

      return config;
    };

  /**
   * Create a new, blessed object with public properties,
   * shared properties (on prototype), and support for
   * privacy (via initFunction).
   * 
   * @param {object} sharedProperties Properties to add to prototype
   * @param {object} instanceProperties
   * @param {function} initFunction Closure function
   * 
   * @return {object}
   */
  o = function o(sharedProperties, instanceProperties, initFunction) {
    var optionNames = 'sharedProperties, instanceProperties, initFunction',
      config,
      fn,
      obj;

    config = getConfig(optionNames, sharedProperties, instanceProperties,
        initFunction);
    config.initFunction = config.initFunction || defaultInit;
    fn = config.sharedProperties;

    bless(fn);

    obj = extend(Object.create(fn), {fn: fn},
      config.instanceProperties);

    return config.initFunction.call(obj);
  };

  bless(o);

  extend(o, {
    /**
     * Returns an object factory that stamps out objects
     * using a specified shared prototype and init.
     * 
     * @param {object} sharedProperties Properties to share
     * @param {object} defaultProperties Default instance properties
     * @param {function} initFunction For privacy
     * 
     * @return {function} A new object factory.
     */
    factory: function factory(sharedProperties, defaultProperties,
        initFunction) {
      var optionNames = 'sharedProperties, defaultProperties, initFunction',
        config;

      config = getConfig(optionNames, sharedProperties, defaultProperties,
          initFunction);
      config.initFunction = config.initFunction || defaultInit;

      return bless(function (options) {
        var defaultProperties = config.defaultProperties || {},
          sharedProperties = config.sharedProperties || {},
          instance = extend(defaultProperties, options),
          obj = extend(o(sharedProperties, instance,
            config.initFunction));
        return config.initFunction.call(obj);
      });
    },
    addPlugins: addPlugins
  });

  api = {};
  api[name] = o;

  extend(exports, api);
}((typeof exports === 'undefined')
    ? this
        : exports,
  jQuery));

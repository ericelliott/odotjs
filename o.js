/**
 * odotjs - Prototypal OO made easy.
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */

/*global exports */
// Shim .forEach()
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fn, scope) {
    var i,
      length = this.length;
    for (i = 0, length; i < length; ++i) {
      fn.call(scope || this, this[i], i, this);
    }
  };
}

// Shim Object.create()
if (!Object.create) {
  Object.create = function (o) {
    if (arguments.length > 1) {
      throw new Error('Object.create implementation only accepts the first parameter.');
    }
    function F() {}
    F.prototype = o;
    return new F();
  };
}


(function (exports) {
  'use strict';
  var namespace = 'odotjs',

    // Adapted from Underscore.
    extend = function extend(obj) {
      var args = [].slice.call(arguments, 1);
      args.forEach(function (source) {
        var prop;
        for (prop in source) {
          obj[prop] = source[prop];
        }
      });
      return obj;
    },

    plugins = {},

    // Add to the global plugin collection.
    addPlugins = function (newPlugins) {
      extend(plugins, newPlugins);
    },

    // Add to the current object prototype.
    share = function share(name, prop) {
      this.proto[name] = prop;
    },

    // Pass the global plugins to the object
    // prototype.
    bless = function bless(proto) {
      proto.share = share;

      extend(proto, plugins);

      return proto;
    },
    o,
    api,
    defaultInit = function init() {
      return this;
    },

    /**
     * The user can pass in the formal parameters, or a named
     * parameters. Either way, we need to initialize the
     * variables to the expected values.
     *
     * @param {String} optionNames Parameter names.
     *
     * @return {object} New configuration object.
     */
    getConfig = function getConfig(optionNames) {
      var config = {}, // New config object
        // Comma separated string to Array
        names = optionNames.split(','),
        // Turn arguments into array, starting at index 1
        args = [].slice.call(arguments, 1);

      names.forEach(function (optionName, index) {
        // Strip whitespace
        optionName = optionName.trim();

        // Use first argument as params object...
        config[optionName] = (args[0] && args[0][optionName])
          || args[index]; // or grab the formal parameter.
      });

      return config;
    };

  /**
   * Create a new, blessed object with public properties,
   * shared properties (on prototype), and support for
   * privacy (via initFunction).
   *
   * @param {object} sharedProperties Prototype
   * @param {object} instanceProperties Instance safe
   * @param {function} initFunction Init and privacy
   *
   * @return {object}
   */
  o = function o(sharedProperties, instanceProperties,
      initFunction) {
    var optionNames = 'sharedProperties, instanceProperties,'
        + ' initFunction',
      config,
      proto,
      obj;

    config = getConfig(optionNames, sharedProperties,
      instanceProperties, initFunction);
    config.initFunction = config.initFunction || defaultInit;
    proto = config.sharedProperties || {};

    bless(proto);

    obj = extend(Object.create(proto), {proto: proto},
      config.instanceProperties);

    return config.initFunction.call(obj);
  };

  bless(o);

  extend(o, {
    /**
     * Returns an object factory that stamps out objects
     * using a specified shared prototype and init.
     *
     * @param {object} sharedProperties Prototype
     * @param {object} defaultProperties Instance safe
     * @param {function} initFunction Init and privacy
     *
     * @return {function} A new object factory.
     */
    factory: function factory(sharedProperties, defaultProperties,
        instanceInit, factoryInit) {
      var optionNames = 'sharedProperties, defaultProperties,'
          + ' instanceInit, factoryInit',
        config,
        initObj = o();

      config = getConfig(optionNames, sharedProperties,
        defaultProperties, instanceInit, factoryInit);
      config.instanceInit = config.instanceInit || defaultInit;

      // factoryInit can be used to initialize shared private state.
      if (typeof config.factoryInit === 'function') {
        config.factoryInit.call(initObj);
      }

      return bless(function (options) {
        var defaultProperties = config.defaultProperties || {},
          sharedProperties = extend(config.sharedProperties || {}, initObj),
          instance = extend(defaultProperties, options),
          obj = extend(o(sharedProperties, instance)),
          init = config.instanceInit;
        return ((typeof init === 'function')
          ? init.call(obj)
          : obj);
      });
    },
    addPlugins: addPlugins,
    extend: extend,
    getConfig: getConfig
  });

  api = o;

  exports[namespace] = api;
}((typeof exports === 'undefined')
    ? this
    : exports));

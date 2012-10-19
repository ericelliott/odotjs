/*global module, test, ok, equal, odotjs, deepEqual,
stop, setTimeout, start */
(function (o) {
  'use strict';

  // This test is only here because the tests are failing
  // in Travis and this seems to fix the problem.
  test('Timeout hack', function () {
    stop();
    setTimeout(function () {
      ok(true, 'Timeout reached.');
      start();
    }, 3000);
  });

  var testObj,
    testObj2,
    testFactory,
    o1,
    o2,
    control;

  testObj = o(
    {
      sharedProp: 'shared property'
    },
    {
      instanceProp: 'instance property'
    },
    function () {
      var privateProp = 'private property';

      this.share('getPrivate', function getPrivate() {
        return privateProp;
      });

      return this;
    }
  );

  testObj2 = o({
    sharedProperties: {
      sharedProp: 'shared property 2'
    },
    instanceProperties: {
      instanceProp: 'instance property 2'
    },
    initFunction: function () {
      var privateProp = 'private property 2';

      this.share('getPrivate', function getPrivate() {
        return privateProp;
      });

      return this;
    }
  });

  testFactory = o.factory(
    {
      sharedProp: 'shared property'
    },
    {
      instanceProp: 'instance property'
    },
    function () {
      var privateProp = 'private property',
        counter = 0;

      this.share('getPrivate', function getPrivate() {
        return privateProp;
      });

      // If you set the count method on the instance,
      // it will get its own counter.
      this.count = function count(number) {
        number = number || 0;
        return (counter += number);
      };

      return this;
    }
  );

  o1 = testFactory();
  o2 = testFactory({
    instanceProp: 2,
    name: 'Danny Dance'
  });
  o2.share('shared', 3);
  o2.count(6);

  control = o({});
  control.share('button', function () {
    return this.extend(this, {
      selector: '.button',
      on: {
        'click': function () {
          this.trigger('clicked');
        }
      }
    });
  });

  module('o');

  test('o with arguments creates valid objects', function () {
    ok(testObj.hasOwnProperty('instanceProp'),
      'Instance property should be on instance.');

    equal(testObj.instanceProp, 'instance property',
      'Instance property should be "instance property".');

    ok(!testObj.hasOwnProperty('sharedProp'),
      'Shared prop should NOT be on instance.');

    equal(testObj.sharedProp, 'shared property',
      'Shared property should be "shared property"');

    ok(!testObj.privateProp,
      'Private property should be private.');

    ok(!testObj.hasOwnProperty('getPrivate'),
      '.share() should NOT add methods to instance API.');

    equal(testObj.getPrivate(), 'private property',
      'Private property should be "private property".');
  });

  test('o with options object creates valid objects', function () {
    ok(testObj2.hasOwnProperty('instanceProp'),
      'Instance property should be on instance.');

    equal(testObj2.instanceProp, 'instance property 2',
      'Instance property should be "instance property 2".');

    ok(!testObj2.hasOwnProperty('sharedProp'),
      'Shared prop should NOT be on instance.');

    equal(testObj2.sharedProp, 'shared property 2',
      'Shared property should be "shared property 2"');

    ok(!testObj2.privateProp,
      'Private property should be private.');

    ok(!testObj2.hasOwnProperty('getPrivate'),
      '.share() should NOT add methods to instance API.');

    equal(testObj2.getPrivate(), 'private property 2',
      'Private property should be "private property 2".');

  });

  test('factory with arguments creates valid objects', function () {
    ok(typeof testFactory === 'function',
      '.factory() method produces valid functions.');


    ok(o1.hasOwnProperty('instanceProp'),
      'Instance property should be on instance.');

    equal(o1.instanceProp, 'instance property',
      'Instance property should be "instance property".');

    ok(!o1.hasOwnProperty('sharedProp'),
      'Shared prop should NOT be on instance.');

    equal(o1.sharedProp, 'shared property',
      'Shared property should be "shared property"');

    ok(!o1.privateProp,
      'Private property should be private.');

    ok(!o1.hasOwnProperty('getPrivate'),
      '.share() should NOT add methods to instance API.');

    equal(o1.getPrivate(), 'private property',
      'Private property should be "private property".');

    ok(!o1.hasOwnProperty('shared'),
      '.share() should NOT add methods to instance API.');

    equal(o1.shared, 3,
      '.shared should be 3.');

    equal(o1.count(), 0,
      '.count() should be 0.');



    ok(o2.hasOwnProperty('instanceProp'),
      'Instance property should be on instance.');

    equal(o2.instanceProp, 2,
      'Instance property should be "2".');


    ok(o2.hasOwnProperty('name'),
      '.name should be on instance.');

    equal(o2.name, 'Danny Dance',
      '.name should be "Danny Dance".');


    ok(!o2.hasOwnProperty('sharedProp'),
      'Shared prop should NOT be on instance.');

    equal(o2.sharedProp, 'shared property',
      'Shared property should be "shared property"');

    ok(!o2.privateProp,
      'Private property should be private.');

    ok(!o2.hasOwnProperty('getPrivate'),
      '.share() should NOT add methods to instance API.');

    equal(o2.getPrivate(), 'private property',
      'Private property should be "private property".');

    ok(!o2.hasOwnProperty('shared'),
      '.share() should NOT add methods to instance API.');

    equal(o2.shared, 3,
      '.shared should be 3.');

    equal(o2.count(), 6,
      '.count() should be 6');


    o2.count(1);
    equal(o2.count(), 7,
      '.count() should be 7');

    equal(o1.count(), 0,
      'o1.count() should be unchanged.');
  });

  test('.factory({ignoreOptions: true})', function() {

    var factory = o.factory({
        defaultProperties: { foo: 'bar' },
        ignoreOptions: true
      }),
      instance = factory({ foo: 'baz' });

    equal(instance.foo, 'bar',
      'The o.factory({ ignoreOptions: true}) setting should allow ' +
      'the instance factory to skip adding options to the created ' +
      'object.');
  });

}(odotjs));


(function (o) {
  'use strict';
  var testObj = Object.create({bar: true}),
    foo = o({}, testObj);
  test('Inherit from prototypes.', function () {
    ok(foo.bar,
      'Should inherit from instance object prototypes');
  });
}(odotjs));

(function (o) {
  'use strict';
  var proto = {},
    a = o(proto, {},
      function init() {
        var count = 1,
          secret = 'a';

        this.share('getCount', function getCount() {
          return count;
        });

        this.share('add', function add(num) {
          count += num || 1;
        });

        this.getSecret = function getSecret() {
          return secret;
        };

        return this;
      }),
    b = o(proto, {},
      function init() {
        var secret = 'b';
        this.add();

        this.getSecret = function getSecret() {
          return secret;
        };

        return this;
      });
  test('Private state and shared private state.', function () {
    equal(a.getCount(), b.getCount(),
      'Different instances should be able to share private' +
      ' data.');

    ok(a.getSecret() !== b.getSecret(),
      'Each instance should have access to its own' +
      ' private state.');
  });
}(odotjs));

(function (o) {
  'use strict';
  var factory = o.factory({}, {},
      function instanceInit() {
        var secret;

        this.setSecret = function setSecret(newSecret) {
          secret = newSecret;
          return this;
        };

        this.getSecret = function getSecret() {
          return secret;
        };

        this.add();

        return this;
      },      
      function factoryInit() {
        var count = 0;

        this.share('getCount', function getCount() {
          return count;
        });

        this.share('add', function add(num) {
          count += num || 1;
        });

        return this;
      }),
      a = factory().setSecret('a'),
      b = factory().setSecret('b');

  test('Private state and shared private state w/factory.',
    function () {
      equal(a.getCount(), b.getCount(),
        'Different instances should be able to share private' +
        ' data.');

      ok(a.getSecret() !== b.getSecret(),
        'Each instance should have access to its own' +
        ' private state.');
    });

  test('O.factory() instance safety', function () {
    var myFactory = o.factory({
        sharedProperties: { shared: true }
      }),
      a = myFactory({instance: 'a'}),
      b = myFactory({instance: 'b'});

    equal(a.instance, 'a',
      'Instance `a` should not change when instance `b` ' +
      'properties change.');
    equal(b.instance, 'b',
      'Instance `b` should be different from instance `a`.');
  });

  test('O.factory() instance safety w/ ignoreOptions', function () {
    var myFactory = o.factory({
        sharedProperties: { shared: true },
        defaultProperties: {
          attrs: { instance: false }
        },
        instanceInit: function (options) {
          o.extend(this.attrs, options);
          return this;
        },
        ignoreOptions: true
      }),
      a = myFactory({instance: 'a'}),
      b = myFactory({instance: 'b'});

    equal(a.attrs.instance, 'a',
      'Instance `a` should not change when instance `b` ' +
      'properties change.');
    equal(b.attrs.instance, 'b',
      'Instance `b` should be different from instance `a`.');
  });


  test('Utilities', function () {
      deepEqual(o.mapOptions('a, b, c', 1, 2, 3),
        {a:1,b:2, c:3},
        '.mapOptions() should map parameters to names, ' +
        'and return the resulting named parameters hash.');   
  });
}(odotjs));
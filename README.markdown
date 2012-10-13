odotjs [![Build Status](https://secure.travis-ci.org/dilvie/odotjs.png)](http://travis-ci.org/dilvie/odotjs)
======

A prototypal object library that makes it easy to create objects or factories with a predefined prototype, instance members, and even data privacy and initialization. A flexible alternative to class-based systems that exposes, rather than obscures JavaScript's prototypal nature.


## Status
odotjs is still very new and the API could change. Make sure that your project's tests still pass when you upgrade to a new version.


## Quick Start
*Tip* - You can pass odotjs into your Immediately Invoked Function Expression (IIFE) so you can access it with the convenient `o` shortcut:

    (function (o) {

    }(odotjs));

Most of my work is on applications, so I like to expose it via the application sandbox:

    (function (app) {
      var namespace = 'someModule',
        moduleApi = app.o({
          doSomething: function doSomething {}
        });

      app.register(namespace, moduleApi);
    }(myAppNamespace));

According to the seminal book, ["Design Patterns: Elements of Reusable Object-Oriented Architecture"](http://www.amazon.com/gp/product/0201633612?ie=UTF8&tag=ericleads-20&linkCode=shr&camp=213733&creative=393185&creativeASIN=0201633612&redirect=true),
the two fundamental principles of reusable OO design are: "Program to an interface, not an implementation" and "Favor object composition over class inheritance".

JavaScript's OO features make it easy to follow those fundamental design principles, but it could be easier yet. In order to program to an interface, rather than an implementation, it's important to clearly define exactly what that interface is. The best way to do that is to enforce it via encapsulation. Anything that is not the interface should not be exposed via public properties. Unfortunately, in order to enforce encapsulation in JavaScript, you have to jump through a few hoops which tend to obscure your intentions, rather than make them explicit.

A common pattern is to create an object that has a prototype that can be shared with other objects, some private data shared between all objects that share the prototype, and private data that is only accessible by a single object instance. Here's how you might do a one-off object like that in vanilla JavaScript:

    var testProto = (function () {
        var privateProp = 'private property';

        return {
          sharedProp: 'shared property',
          getPrivate: function getPrivate() {
            return privateProp;
          }
        };
      }()),

      testObj = (function () {
        var testObj = Object.create(testProto);

        testObj.instanceProp = 'instance property';
        return testObj;
      }());

You're probably accustomed to using constructor functions to do the same thing. In that case, you'd write very similar methods, with a bunch of extra cruft to guard global variable polution from mutating the wrong `this`. For more detail on why constructors are harmful in JavaScript, see [example code](https://github.com/dilvie/fluentjs1/blob/master/fluent-javascript.js) from my talk, ["Fluent JavaScript Part 1: Prototypal OO"](http://ericleads.com/2012/06/fluent-javascript-part-1-prototypal-oo/).

Either way, the resulting code is not particularly explicit or easy to read. You have to look closely to see that the intended purpose of the function is to encapsulate scope for data privacy.

The same thing can be accomplished in odotjs with the following code:

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

For much larger objects, you'll see savings in how much code you have to type, but more importantly, your intention is explicitly spelled out. You can pass any prototype in with the `sharedProperties`, and share the same prototype with any other object. Anything you add to the prototype with the `.share()` method will be available for all other objects sharing the prototype.

Here are some QUnit tests that demonstrate the properties of the object created with the above code. All tests pass:

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

Similarly, odotjs can create factories:

      testFactory = o.factory({
        sharedProperties: {
          sharedProp: 'shared property'
        },
        defaultProperties: {
          instanceProp: 'instance property'
        },
        factoryInit: function factoryInit() {
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
      });

Create an instance with default values:

    var o1 = testFactory();

Override some defaults:

    var o2 = testFactory({
      instanceProp: 2,
      name: 'Danny Dance'
    });


### ignoreOptions

Sometimes you don't want to add the instance factory options to the created object. No problem:

    var factory = o.factory({
        defaultProperties: { foo: 'bar' },
        ignoreOptions: true
      }),
      instance = factory({ foo: 'baz' });

    equal(instance.foo, 'bar',
      'The o.factory({ ignoreOptions: true}) setting should allow ' +
      'the instance factory to skip adding options to the created ' +
      'object.');

## Utilities

### `o.mapOptions` 

Transform any function into a polymorphic function which can take either a list of aurgemnts, or a named options hash.

    function foo(param1, param2, param3) {
        var options = o.mapOptions('param1, param2, param3', param1, param2, param3);
        
        // Log the value of param2, regardless of whether
        // the function was called with a named parameters
        // object, or comma separated arguments.
        console.log(options.param2);
    }


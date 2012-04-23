/* Creating objects in JavaScript */

/*
Imagine your project spec calls for describing cars. It's time to build some car objects. If you pick up almost any book about JavaScript, it will teach you that you build objects using constructor functions. Just say no.

There are some serious limitations to this way of doing things. The first and most trivial is that you must always call a constructor using the new keyword. Failing to do so will pass the global object in as this. Your car properties and methods will clobber the global namespace. If you have more than one car, they will not be instance safe. There's a simple workaround that requires a boilerplate check inside every constructor function, but that doesn't solve the real problem.

The real problem is that using constructors will almost always get you thinking in classical OO mode. You might start to think, "I want to subclass x..." and that's where you get into trouble. You're ignoring two of the best features of JavaScript: Dynamic property definition and prototypal inheritance. The two combined are a much more powerful and flexible way to reuse code than classical inheritance.

Using constructor functions is an accent. Programmers with a background in other languages can be said to be immigrants in JavaScript land. They often bring with them preconceived notions about how to solve problems. In particular, programmers with a background in classical OO tend to have a hard time letting it go.

Programmers who learned JavaScript as a first language are far less likely to be attached to classical OO and inheritance, because it's harder to implement in JavaScript than the viable, native alternatives. The former group has an accent, while the latter are JavaScript natives, fluent in JavaScript.
*/

$(function() {
	function Car(color, direction, mph) {
		this.color = color || 'pink';
		this.direction = direction || 0; // 0 = Straight ahead
		this.mph = mph || 0;

		this.gas = function gas(amount) {
			amount = amount || 10;
			this.mph += amount;
			return this;
		};
		this.brake = function brake(amount) {
		  amount = amount || 10;
			this.mph = ((this.mph - amount) < 0)? 0
				: this.mph - amount;
			return this;
		};
	}

	var myCar = new Car();
	test('Constructor', function () {
		ok(myCar.color, 'Has a color');
		equal(myCar.accellerate().mph, 10,
				'.accelerate() should add 10mph.'
			);
		equal(myCar.brake(5).mph, 5,
				'.brake(5) should subtract 5mph.'
			);			
	});
});

/*
One of the common complaints about this was, "Where's the encapsulation? If there's no data hiding, it's not really OO!"

To which the JavaScript community answered, it's right here:
*/


$(function() {
	function Car(color, direction, mph) {
		var isParkingBrakeOn = false;
		this.color = color || 'pink';
		this.direction = direction || 0; // 0 = Straight ahead
		this.mph = mph || 0;

		this.gas = function gas(amount) {
			amount = amount || 10;
			this.mph += amount;
			return this;
		};
		this.brake = function brake(amount) {
		  amount = amount || 10;
			this.mph = ((this.mph - amount) < 0)? 0
				: this.mph - amount;
			return this;
		};
		this.toggleParkingBrake = function toggleParkingBrake() {
			return !!isParkingBrakeOn;
		};
	}

	var myCar = new Car();
	test('Constructor with private property.', function () {
		ok(myCar.color, 'Has a color');
		equal(myCar.accellerate().mph, 10,
			'.accelerate() should add 10mph.'
		);
		equal(myCar.brake(5).mph, 5,
			'.brake(5) should subtract 5mph.'
		);
		ok(myCar.toggleParkingBrake,
			'.toggleParkingBrake works.'
		);
	});
});

/*
The state of the parking brake is now private. Only the functions defined inside the Car constructor have access to it.
*/

/*
Setting asside that this car has no steering wheel, you can do better. Take a  look at another popular way that will allow you to share the methods with all instances of car, even add new ones after instantiation. Simply extend the constructor function's prototype property:
*/

$(function () {
	function Car(color, direction, mph) {
		this.color = color || 'pink';
		this.direction = direction || 0; // 0 = Straight ahead
		this.mph = mph || 0;
	}

	Car.prototype.gas = function gas(amount) {
		amount = amount || 10;
		this.mph += amount;
		return this;
	};
	Car.prototype.brake = function brake(amount) {
	  amount = amount || 10;
		this.mph = ((this.mph - amount) < 0)? 0
			: this.mph - amount;
		return this;
	};

	var myCar = new Car();
	test('Constructor with prototype methods.', function () {
		ok(myCar.color, 'Has a color');
		equal(myCar.accellerate().mph, 10,
			'.accelerate() should add 10mph.'
		);
		equal(myCar.brake(5).mph, 5,
			'.brake(5) should subtract 5mph.'
		);
	});

});

/*
That mimics the flyweight pattern from other languages. Using the first version, every instance of Car will have its own copies of accellerate and brake. If you have a collection of objects that each share a lot of methods, sharing methods on the prototype can be a great way to reduce resource consumption.

Note that you've lost the private parking brake functionality. If you define the function outside the constructor function, you can't access private variables in the constructor.
*/

/*
All of this does what it's supposed to do, but we're ignoring one of the coolest features of JavaScript: Object literal notation. Fluent JavaScript programmers take advantage of it whenever they can. If you're only building one car, it's easy:
*/

$(function () {
	var myCar = {
		color: 'pink',
		direction: 0,
		mph: 0,

		gas: function gas(amount) {
			amount = amount || 10;
			this.mph += amount;
			return this;
		},
		brake: function brake(amount) {
		  amount = amount || 10;
			this.mph = ((this.mph - amount) < 0)? 0
				: this.mph - amount;
			return this;
		}
	};

	test('Object literal notation.', function () {
		ok(myCar.color, 'Has a color');
		equal(myCar.accellerate().mph, 10,
			'.accelerate() should add 10mph.'
		);
		equal(myCar.brake(5).mph, 5,
			'.brake(5) should subtract 5mph.'
		);
	});
});

/*
If you want to reproduce the full functionality of the first version, you can create a factory:
*/

$(function () {
	var car = function car(color, direction, mph) {
		return {
			color: color || 'pink',
			direction: direction || 0,
			mph: mph || 0,

			gas: function gas(amount) {
				amount = amount || 10;
				this.mph += amount;
				return this;
			},
			brake: function brake(amount) {
			  amount = amount || 10;
				this.mph = ((this.mph - amount) < 0)? 0
					: this.mph - amount;
				return this;
			}
		};
	},
	myCar = car('orange', 0, 0);
	test('Factory with object literal.', function () {
		ok(myCar.color, 'Has a color');
		equal(myCar.accellerate().mph, 10,
			'.accelerate() should add 10mph.'
		);
		equal(myCar.brake(5).mph, 5,
			'.brake(5) should subtract 5mph.'
		);
	});

});


/*
And you can get your private parking brake back:
*/

$(function () {
	var car = function car(color, direction, mph) {
		var isParkingBrakeOn = false;

		return {
			color: color || 'pink',
			direction: direction || 0,
			mph: mph || 0,

			gas: function gas(amount) {
				amount = amount || 10;
				this.mph += amount;
				return this;
			},
			brake: function brake(amount) {
			  amount = amount || 10;
				this.mph = ((this.mph - amount) < 0)? 0
					: this.mph - amount;
				return this;
			},
			toggleParkingBrake: function toggleParkingBrake() {
				isParkingBrakeOn = !isParkingBrakeOn;
			}
		};
	},
	myCar = car('orange', 0, 5);

	test('Factory with private variable.', function () {
		ok(myCar.color, 'Has a color');
		equal(myCar.accellerate().mph, 10,
			'.accelerate() should add 10mph.'
		);
		equal(myCar.brake(5).mph, 5,
			'.brake(5) should subtract 5mph.'
		);
		ok(myCar.toggleParkingBrake,
			'.toggleParkingBrake works.'
		);
	});

});


/*
And make flyweights:
*/

$(function () {
	var methods = {
			gas: function gas(amount) {
				amount = amount || 10;
				this.mph += amount;
				return this;
			},
			brake: function brake(amount) {
			  amount = amount || 10;
				this.mph = ((this.mph - amount) < 0)? 0
					: this.mph - amount;
				return this;
			}
		},
		car = function car(color, direction, mph) {
			var isParkingBrakeOn = false;

			return {
				color: color || 'pink',
				direction: direction || 0,
				mph: mph || 0,

				accellerate: methods.accellerate,
				brake: methods.brake,

				/**
				 * Privilaged methods must be defined inside
				 * the factory function.
				 */
				toggleParkingBrake: function toggleParkingBrake() {
					isParkingBrakeOn = !isParkingBrakeOn;
				}
			};
		},
		myCar = car();

	test('Flyweight factory with private variable.', function () {
		ok(myCar.color, 'Has a color');
		equal(myCar.accellerate().mph, 10,
			'.accelerate() should add 10mph.'
		);
		equal(myCar.brake(5).mph, 5,
			'.brake(5) should subtract 5mph.'
		);
		ok(myCar.toggleParkingBrake,
			'.toggleParkingBrake works.'
		);
	});		
});

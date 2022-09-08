/*
	TITLE: SuperSubClass

	DESCRIPTION: A contrived example of ES6 class inheritance.

*/

class SuperClass {

	constructor() {
		console.log('SuperClass:constructor:2');
		this.initialize();
	}

	initialize() {
		console.log('SuperClass:initialize:4');
		this.methodFooBar();
	}

	methodFooBar() {
		console.log('SuperClass:methodFooBar:6');
		this.methodQuxZot();
	}

	methodQuxZot() {
		console.log('SuperClass:methodQuxZot:7');
	}

}

class SubClass extends SuperClass {

	constructor() {
		//CANNOT use 'this' keyword in subclass constructor BEFORE calling super().
		// this.foo = 'bar';
		console.log('SubClass:constructor:pre:super:1');
		//subclass constructor MUST call super()!
		super();
		//the 'this' keyword is OK to use AFTER calling super().
		this.qux = 'zot';
		//note how these logs gets called last; it is almost pointless to add
		//anything to the subclass constructor after calling super().
		console.log('SubClass:constructor:post:super:9');
		console.log('SubClass:qux:' + this.qux + ':10');
	}

	initialize() {
		console.log('SubClass:initialize:pre:super:3');
		this.foo = 'bar';
		super.initialize();
		console.log('SubClass:initialize:post:super:8');
	}

	methodFooBar() {
		console.log('SubClass:foo:' + this.foo + ':5');
		super.methodFooBar();
	}

	// methodQuxZot() {
	// 	super.methodQuxZot();
	// }

}

export { SuperClass, SubClass };

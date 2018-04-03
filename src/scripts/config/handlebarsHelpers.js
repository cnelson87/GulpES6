/* eslint-disable */
var Handlebars = require('handlebars/runtime')['default'];

const HandlebarsHelpers = function() {

	/**
	 * Compare a value
	 * @return {[type]} [description]
	 */
	Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

		var operators, result;

		if (arguments.length < 3) {
			throw new Error("Handlebars Helper 'compare' needs 2 parameters");
		}

		if (options === undefined) {
			options = rvalue;
			rvalue = operator;
			operator = "===";
		}

		operators = {
			'==': function (l, r) { return l == r; },
			'===': function (l, r) { return l === r; },
			'!=': function (l, r) { return l != r; },
			'!==': function (l, r) { return l !== r; },
			'<': function (l, r) { return l < r; },
			'>': function (l, r) { return l > r; },
			'<=': function (l, r) { return l <= r; },
			'>=': function (l, r) { return l >= r; },
			'typeof': function (l, r) { return typeof l == r; }
		};

		if (!operators[operator]) {
			throw new Error("Handlebars Helper 'compare' doesn't know the operator " + operator);
		}

		result = operators[operator](lvalue, rvalue);

		if (result) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}

	});

};

export default HandlebarsHelpers;
/* eslint-enable */

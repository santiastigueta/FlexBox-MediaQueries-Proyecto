/*!
ValueFuture by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(global){

	if(typeof define === 'function' && define.amd){
		define(['./Future'], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(require('./Future'));
		return;
	}

	global.ValueFuture = definer(global.Future);
	return;




	function definer(Future){

		ValueFuture.prototype = Object.create(Future.prototype, {
			constructor: {
				value: ValueFuture
				, enumerable: false
				, writable: true
				, configurable: true
			}
		});

		return ValueFuture;

		function ValueFuture(value){
			if(this === global) throw "please use the 'new' keyword";

			Future.apply(this);

			var future = this;

			future.get = function(cb){
				cb(null, value);
			}//get

			future.set = function(newValue){
				if(value === newValue) return false;

				value = newValue;
				future.emit('change');

				return true;
			}//set

		}//ValueFuture

	}//definer

})(this);

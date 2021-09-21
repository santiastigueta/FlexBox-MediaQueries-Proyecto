/*!
la by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(global){

	if(typeof define === 'function' && define.amd){
		define([
			'./Future'
			, './ValueFuture'
			, './LazyFuture'
		], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(
			require('./Future')
			, require('./ValueFuture')
			, require('./LazyFuture')
		);
		return;
	}

	global.la = definer(
		global.Future
		, global.ValueFuture
		, global.LazyFuture
	);
	return;



	function definer(
		Future
		, ValueFuture
		, LazyFuture
	){

		return {
			Future: Future
			, ValueFuture: ValueFuture
			, LazyFuture: LazyFuture
		}		

	}//definer

})(this);

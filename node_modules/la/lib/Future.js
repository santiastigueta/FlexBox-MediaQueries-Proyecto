/*!
Future by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(global){

	if(typeof define === 'function' && define.amd){
		define(['events'], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(require('events'));
		return;
	}

	global.Future = definer(global.events);
	return;

	function notImplemented(){
		throw 'not implemented';
	}//notImplemented

	function definer(events){
		var EventEmitter = events.EventEmitter;

		Future.prototype = Object.create(EventEmitter.prototype, {
			constructor: {
				value: Future
				, enumerable: false
				, writable: true
				, configurable: true
			}
		});

		Future.prototype.get = notImplemented;
		Future.prototype.dispose = function(){
			this.emit('dispose');
			this.removeAllListeners();
		}//dispose

		return Future;

		function Future(resolver){
			if(this === global) throw "please use the 'new' keyword";
			
			EventEmitter.apply(this);

			var future = this;
			var valueBinders = [];

			future.on('change', future_change);

			function future_change(){
				valueBinders.forEach(function(valueBinder){
					future.get(valueBinder);
				});
			}//

			future.bind = bindValue;
			future.unbind = unbindValue;

			function bindValue(valueBinder){
				unbindValue(valueBinder);
				valueBinders.push(valueBinder);
				future.get(valueBinder);
			}//bindValue

			function unbindValue(valueBinder){
				var valueBinderIndex = valueBinders.indexOf(valueBinder);
				if(valueBinderIndex >= 0) binders.splice(valueBinderIndex, 1);
			}//unbindValue


		}//Future

	}//definer

})(this);

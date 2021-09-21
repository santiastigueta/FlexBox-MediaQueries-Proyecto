/*!
LazyFuture by "Elmer Bulthuis" <elmerbulthuis@gmail.com>
*/

(function(global){

	var slice = Array.prototype.slice;



	if(typeof define === 'function' && define.amd){
		define(['./Future'], definer);
		return;
	}

	if(typeof module !== 'undefined' && module.exports){
		module.exports = definer(require('./Future'));
		return;
	}

	global.LazyFuture = definer(global.Future);
	return;

	function forEachRecursive(array, fn){
		array.forEach(function(item){
			if(Array.isArray(item)){
				forEachRecursive(item);
			}
			else{
				fn(item);
			}
		});
	}//forEachRecursive

	function definer(Future){

		LazyFuture.prototype = Object.create(Future.prototype, {
			constructor: {
				value: LazyFuture
				, enumerable: false
				, writable: true
				, configurable: true
			}
		});

		return LazyFuture;

		function LazyFuture(){
			if(this === global) throw "please use the 'new' keyword";

			Future.apply(this);

			var future = this;

			var argumentCount = arguments.length;
			var argumentIndex = 0;
			var trackDependencies = false;

			var dependencies = []
			var resolver = null;
			var canceller = null;
			var cachedValue = null;
			var resolveState = 0;
			var resolveResult = null;
			var getValueQueue = [];
			var paralellism = 2;

			while(
				argumentIndex < argumentCount 
				&& (arguments[argumentIndex] instanceof Future || Array.isArray(arguments[argumentIndex]))
			){
				dependencies.push(arguments[argumentIndex]);
				argumentIndex++;
			}
			if(
				argumentIndex < argumentCount
				&& typeof arguments[argumentIndex] == 'function'
			){
				resolver = arguments[argumentIndex];
				argumentIndex++;
			}
			if(
				argumentIndex < argumentCount
				&& typeof arguments[argumentIndex] == 'function'
			){
				canceller = arguments[argumentIndex];
				argumentIndex++;
			}
			if(
				argumentIndex < argumentCount
				&& typeof arguments[argumentIndex] == 'boolean'
			){
				trackDependencies = arguments[argumentIndex];
				argumentIndex++;
			}

			if(argumentIndex != argumentCount) throw 'bad arguments';
			if(!resolver) throw 'no resolver';


			if(trackDependencies){
				forEachRecursive(dependencies, function(dependency){
					dependency.addListener('change', dependency_change);
				});

				future.addListener('dispose', function(){
					forEachRecursive(dependencies, function(dependency){
						dependency.removeListener('change', dependency_change);
					});
				});
			}

			future.get = getValue;


			function dependency_change(){
				resetValue();
				future.emit.apply(future, ['change'].concat(slice.call(arguments)));
			}//dependency_change


			function resolveDependencies(dependencies, cb){
				var dependencyCount = dependencies.length;
				var results = new Array(dependencyCount);
				var firstError = null;
				var startedDependencyIndex = 0;
				var finishedDependencyCount = 0;
				
				function next(){
					if(finishedDependencyCount === dependencyCount) return cb(firstError, results);

					while(startedDependencyIndex - finishedDependencyCount < paralellism && startedDependencyIndex < dependencyCount){
						start(startedDependencyIndex);
					}
				}
				
				function start(dependencyIndex){
					var dependency = dependencies[dependencyIndex];

					startedDependencyIndex++;
					
					if(Array.isArray(dependency)) resolveDependencies(dependency, dependency_cb);
					else dependency.get(dependency_cb);
					
					function dependency_cb(err, value){
						finishedDependencyCount++;
						
						results[dependencyIndex] = value;
						firstError = firstError || err;
						next();
					}
					
				}//start
				
				next();
			}//resolveDependencies


			function flushCallbacks(cbs, err, value){
				if(err && future.listeners('error').length) future.emit('error', err);

				var cb;
				while(cb = cbs.shift()) {
					cb(err, value);
				}
				if(err) resetValue();

			}//flushCallbacks

			function getValue(cb){
				resolveValue();

				if(resolveState == 2){
					flushCallbacks([cb], null, cachedValue);
				}
				else{
					getValueQueue.push(cb);
				}
			}//getValue

			function resolveValue(){
				if(resolveState != 0) return;

				resolveState = 1;
				future.emit('resolving');
				resolveDependencies(dependencies, function(err, results){
					if(err) return flushCallbacks(getValueQueue, err, null);
					
					resolveResult = resolver.apply(this, results.concat([function(err, value){
						if(err) return flushCallbacks(getValueQueue, err, value);
						cachedValue = value;

						resolveState = 2;
						future.emit('resolve');
						flushCallbacks(getValueQueue, null, cachedValue);
					}]));

				});
			}//resolveValue

			function cancelValue(){
				if(resolveState != 1) return;

				//if(!canceller) throw 'no canceller';
				if(canceller) canceller.apply(this, [resolveResult]);
				future.emit('cancel');
			}//cancelValue

			function resetValue(){
				if(resolveState == 0) return;
				cancelValue();
				resolveState = 0;
				future.emit('reset');
				while(getValueQueue.length) getValueQueue.shift();
			}//resetValue

			function getParalellism(){
				return paralellism;
			}//getParalellism
			
			function setParalellism(value){
				paralellism = value;
			}//setParalellism
			
		}//LazyFuture


	}//definer

})(this);

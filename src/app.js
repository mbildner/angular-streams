'use strict';

angular.module('mhb.stream', []);

angular.module('mhb.stream')
.factory('StreamFactory', function($q){
  function Stream(promise, mapFunc){
    var self = this;
    var callbackQueue = [];
    mapFunc = (mapFunc || angular.identity);

    promise.then(null, null, processCallbackQueue);

    function processCallbackQueue(event){
      angular.forEach(callbackQueue, function(cb){
        cb(mapFunc(event));
      });
    }

    this.each = function(cb){
      callbackQueue.push(cb);
      return self;
    };

    this.map = function(transformCallback){
      var mappedStream = new Stream(promise, transformCallback);
      return mappedStream;
    };

    this.merge = function(target){
      var resultDeferred = $q.defer();

      var resultStream = new Stream(resultDeferred.promise);

      self.each(resultDeferred.notify);
      target.each(resultDeferred.notify);

      return resultStream;

    };

    this.reduce = function(callback, accumulator){
      var prev = accumulator;
      var reduceDeferred = $q.defer();

      this.each(function(event){
        prev = callback(prev, event);
        reduceDeferred.notify(prev);
      });

      return new Stream(reduceDeferred.promise);

    };

  }
  return function (promise) { return new Stream(promise); };

});

;(function(angular){
  'use strict';
  angular.module('mhb.stream', []);

  angular.module('mhb.stream')
  .factory('StreamFactory', ['$q', function($q){
    function Stream(promise){
      var self = this;
      var callbackQueue = [];

      promise.then(null, null, processCallbackQueue);

      function processCallbackQueue(event){
        angular.forEach(callbackQueue, function(cb){
          cb(event);
        });
      }

      this.each = function(cb){
        callbackQueue.push(cb);
        return self;
      };

      this.map = function(transform){
        var mappedDeferred = $q.defer();

        var mappedStream = new Stream(mappedDeferred.promise);

        var transformFunc = angular.isFunction(transform)
          ? transform
          : function () { return transform; };

        self.each(function(event){
          mappedDeferred.notify(transformFunc(event));
        });

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

      this.filter = function(test){
        var resultDeferred = $q.defer();

        var resultStream = new Stream(resultDeferred.promise);

        self.each(function(event){
          if (test(event)){
            resultDeferred.notify(event);
          }
        });

        return resultStream;
      };

    }
    return function (promise) { return new Stream(promise); };
  }]);

})(angular);


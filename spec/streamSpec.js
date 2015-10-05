'use strict';

describe('angular streaming service', function(){
  var $q;
  var $rootScope;
  var StreamFactory;

  beforeEach(function(){
    module('mhb.stream');
  });

  beforeEach(inject(function(_$q_, _StreamFactory_, _$rootScope_){
    $q = _$q_;
    $rootScope = _$rootScope_;

    StreamFactory = _StreamFactory_;
  }));

  it('wraps a promise', function(){
    var deferred = $q.defer();
    var stream = StreamFactory(deferred.promise);

    var holder = [];
    stream.each(function(event){
      holder.push(event);
    });

    deferred.notify('first');
    deferred.notify('second');
    deferred.notify('third');

    $rootScope.$digest();
    expect(holder).toEqual(['first', 'second', 'third']);
  });

  describe('#map', function(){
    it('does not mutate the original stream', function(){
      var deferred = $q.defer();
      var stream = StreamFactory(deferred.promise);

      var streamOfLols = stream.map(function(event){
        return 'lol';
      });

      var lolHolder = [];
      streamOfLols.each(function(lol){
        lolHolder.push(lol);
      });

      var holder = [];
      stream.each(function(event){
        holder.push(event);
      });

      deferred.notify('first');
      deferred.notify('second');
      deferred.notify('third');

      $rootScope.$digest();
      expect(holder).toEqual(['first', 'second', 'third']);
      expect(lolHolder).toEqual(['lol', 'lol', 'lol']);
    });

    it('transforms values before sending them through', function(){
      var deferred = $q.defer();
      var stream = StreamFactory(deferred.promise);

      var holder = [];
      stream
        .map(function(event){
          return event + ' was mapped';
        })
        .each(function(event){
          holder.push(event);
        });

      deferred.notify('first');
      deferred.notify('second');
      deferred.notify('third');

      $rootScope.$digest();
      expect(holder).toEqual(['first was mapped', 'second was mapped', 'third was mapped']);
    });
  });

  describe('#each', function(){
    it('returns the original stream', function(){
      var deferred = $q.defer();
      var stream = StreamFactory(deferred.promise);

      var holder = [];
      stream
        .each(function(event){
          holder.push(event + ' 1st');
        })
        .each(function(event){
          holder.push(event + ' 2nd');
        });

      deferred.notify('first');
      deferred.notify('second');
      deferred.notify('third');

      $rootScope.$digest();
      expect(holder).toEqual([
        'first 1st',
        'first 2nd',
        'second 1st',
        'second 2nd',
        'third 1st',
        'third 2nd'
      ]);
    });
  });

  describe('#merge', function(){
    it('provides events from each stream to one interface', function(){
      var deferred1 = $q.defer();
      var deferred2 = $q.defer();

      var stream1 = StreamFactory(deferred1.promise);
      var stream2 = StreamFactory(deferred2.promise);

      var both = stream1.merge(stream2);

      var holder = [];
      both.each(function(event){
        holder.push(event);
      });

      deferred1.notify('d1 notified 1');
      deferred1.notify('d2 notified 1');

      deferred1.notify('d1 notified 2');
      deferred1.notify('d2 notified 2');

      $rootScope.$digest();

      expect(holder).toEqual([
        'd1 notified 1',
        'd2 notified 1',
        'd1 notified 2',
        'd2 notified 2'
      ]);
    });
  });

  describe('#reduce', function(){
    it('emits an accumulation of events', function(){
      var deferred = $q.defer();

      var stream = StreamFactory(deferred.promise);

      var value = '';

      stream
        .reduce(function(accum, event){
          return accum + ' and also ' + event;
        }, 'reduce accumulator')
        .each(function(event){
          value = event;
        });

      deferred.notify('first');
      deferred.notify('second');
      deferred.notify('third');

      $rootScope.$digest();
      expect(value).toBe('reduce accumulator and also first and also second and also third');
    });
  });

  describe('#filter', function(){
    it('re-emits events that pass a test', function(){
      var deferred = $q.defer();

      var stream = StreamFactory(deferred.promise);

      var value = [];

      stream
        .filter(function(event){
          return event % 2;
        })
        .each(function(event){
          value.push(event);
        });

      deferred.notify(1);
      deferred.notify(2);
      deferred.notify(3);
      deferred.notify(4);
      deferred.notify(5);
      deferred.notify(6);
      deferred.notify(7);

      $rootScope.$digest();

      expect(value).toEqual([1, 3, 5, 7]);
    });
  });
});

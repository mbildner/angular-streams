describe('demo', function(){
  it('works', function(){
    var a  = angular.noop();
    expect(a).toBe(undefined);
    expect(typeof angular.forEach).toBe('function');
  });
});

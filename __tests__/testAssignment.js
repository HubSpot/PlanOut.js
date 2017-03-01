var Assignment = require.requireActual('../dist/planout.js').Assignment;
var UniformChoice = require.requireActual('../dist/planout.js').Ops.Random.UniformChoice;
var AssignmentCompat = require.requireActual('../dist/planout_core_compatible.js').Assignment;
var UniformChoiceCompat = require.requireActual('../dist/planout_core_compatible.js').Ops.Random.UniformChoice;

var testerUnit = '4';
var testerSalt = 'test_salt';


describe('Test the assignment module', function() {
  it('Should set constants correctly', function() {
    var a = new Assignment(testerSalt);
    a.set('foo', 12);
    expect(a.get('foo')).toBe(12);
  });

  it('Should set constants correctly (compat)', function() {
    var a = new AssignmentCompat(testerSalt);
    a.set('foo', 12);
    expect(a.get('foo')).toBe(12);
  });

  it('Should work with uniform choice', function() {
    var a = new Assignment(testerSalt);
    var choices = ['a', 'b'];

    a.set('foo', new UniformChoice({'choices': choices, 'unit': testerUnit}));
    a.set('bar', new UniformChoice({'choices': choices, 'unit': testerUnit}));
    a.set('baz', new UniformChoice({'choices': choices, 'unit': testerUnit}));

    expect(a.get('foo')).toEqual('a');
    expect(a.get('bar')).toEqual('a');
    expect(a.get('baz')).toEqual('a');
  });

  it('Should work with uniform choice (compat)', function() {
    var a = new AssignmentCompat(testerSalt);
    var choices = ['a', 'b'];

    a.set('foo', new UniformChoiceCompat({'choices': choices, 'unit': testerUnit}));
    a.set('bar', new UniformChoiceCompat({'choices': choices, 'unit': testerUnit}));
    a.set('baz', new UniformChoiceCompat({'choices': choices, 'unit': testerUnit}));

    expect(a.get('foo')).toEqual('b');
    expect(a.get('bar')).toEqual('a');
    expect(a.get('baz')).toEqual('a');
  });

  it('Should return default values', function() {
    var a = new Assignment(testerSalt);
    a.set('x', 5);
    a.set('y', 6);
    expect(a.get('z', 'boom')).toEqual('boom');
    expect(a.get('test_undefined', 'boom')).toEqual('boom')
    expect(a.get('test_null', 'boom')).toEqual('boom')
  });

  it('Should return default values (compat)', function() {
    var a = new AssignmentCompat(testerSalt);
    a.set('x', 5);
    a.set('y', 6);
    a.set('test_undefined', undefined)
    a.set('test_null', null)
    expect(a.get('z', 'boom')).toEqual('boom');
    expect(a.get('test_undefined', 'boom')).toEqual('boom')
    expect(a.get('test_null', 'boom')).toEqual('boom')
  });

  it('Should work with overrides', function() {
    var a = new Assignment(testerSalt);
    a.setOverrides({'x': 42, 'y': 43});
    a.set('x', 5);
    a.set('y', 6);
    expect(a.get('x')).toEqual(42);
    expect(a.get('y')).toEqual(43);
  });

  it('Should work with overrides (compat)', function() {
    var a = new AssignmentCompat(testerSalt);
    a.setOverrides({'x': 42, 'y': 43});
    a.set('x', 5);
    a.set('y', 6);
    expect(a.get('x')).toEqual(42);
    expect(a.get('y')).toEqual(43);
  });

  it('Should work with falsy overrides', function() {
    var a = new Assignment(testerSalt);
    a.setOverrides({'x': 0, 'y': '', 'z': false});
    a.set('x', 5);
    a.set('y', 6);
    a.set('z', 7);
    expect(a.get('x')).toEqual(0);
    expect(a.get('y')).toEqual('');
    expect(a.get('z')).toEqual(false);
  });

  it('Should work with falsy overrides (compat)', function() {
    var a = new AssignmentCompat(testerSalt);
    a.setOverrides({'x': 0, 'y': '', 'z': false});
    a.set('x', 5);
    a.set('y', 6);
    a.set('z', 7);
    expect(a.get('x')).toEqual(0);
    expect(a.get('y')).toEqual('');
    expect(a.get('z')).toEqual(false);
  });

  it('Should work with custom salts', function() {
    var a = new Assignment(testerSalt);

    a.set('foo', new UniformChoice({'choices': [0, 1, 2, 3, 4, 5, 6, 7], 'unit': testerUnit }));
    expect(a.get('foo')).toEqual(2);

    a.set('saltSeparator', ',');
    a.set('foo', new UniformChoice({'choices': [0, 1, 2, 3, 4, 5, 6, 7], 'unit': testerUnit }));

    expect(a.get('foo')).toEqual(7);
  });

  it('Should work with custom salts (compat)', function() {
    var a = new AssignmentCompat(testerSalt);

    a.set('foo', new UniformChoiceCompat({'choices': [0, 1, 2, 3, 4, 5, 6, 7], 'unit': testerUnit }));
    expect(a.get('foo')).toEqual(7);

    a.set('saltSeparator', ',');
    a.set('foo', new UniformChoiceCompat({'choices': [0, 1, 2, 3, 4, 5, 6, 7], 'unit': testerUnit }));

    expect(a.get('foo')).toEqual(6);
  });
});

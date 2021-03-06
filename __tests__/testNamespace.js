// This is not exposed by the built library, so we load it directly here.
var Utils = jest.requireActual('../es6/lib/utils.js');

// Load up our built library implementations for testing
var Namespace = jest.requireActual('../dist/planout.js').Namespace;
var Experiment = jest.requireActual('../dist/planout.js').Experiment;
var ExperimentSetup = jest.requireActual('../dist/planout.js').ExperimentSetup;
var NamespaceCompat = jest.requireActual('../dist/planout_core_compatible.js').Namespace;
var ExperimentCompat = jest.requireActual('../dist/planout_core_compatible.js').Experiment;
var ExperimentSetupCompat = jest.requireActual('../dist/planout_core_compatible.js').ExperimentSetup;

class BaseExperiment extends Experiment {
  configureLogger() {
    return;
  }

  log(stuff) {
    globalLog.push(stuff);
  }

  previouslyLogged() {
    return;
  }

  getParamNames() {
    return this.getDefaultParamNames();
  }
  setup() {
    this.name = 'test_name';
  }
};

class BaseExperimentCompat extends ExperimentCompat {
  configureLogger() {
    return;
  }

  log(stuff) {
    globalLog.push(stuff);
  }

  previouslyLogged() {
    return;
  }

  getParamNames() {
    return this.getDefaultParamNames();
  }
  setup() {
    this.name = 'test_name';
  }
};

var globalLog = [];
class Experiment1 extends BaseExperiment {
  assign(params, args) {
    params.set('test', 1)
  }
}

class Experiment2 extends BaseExperiment {

  assign(params, args) {
    params.set('test', 2)
  }
}

class Experiment3 extends BaseExperiment {
  assign(params, args) {
    params.set("test2", 3)
  }
}

class Experiment1Compat extends BaseExperimentCompat {
  assign(params, args) {
    params.set('test', 1)
  }
}

class Experiment2Compat extends BaseExperimentCompat {

  assign(params, args) {
    params.set('test', 2)
  }
}

class Experiment3Compat extends BaseExperimentCompat {
  assign(params, args) {
    params.set("test2", 3)
  }
}

class BaseTestNamespace extends Namespace.SimpleNamespace {
  setup() {
    this.setName('test');
    this.setPrimaryUnit('userid');
  }

  setupDefaults() {
    this.numSegments = 100;
  }
};

class BaseTestNamespaceCompat extends NamespaceCompat.SimpleNamespace {
  setup() {
    this.setName('test');
    this.setPrimaryUnit('userid');
  }

  setupDefaults() {
    this.numSegments = 100;
  }
};


describe("Test namespace module", function() {
  var validateLog;
  var validateSegments;
  beforeEach(function() {
    validateLog = function(exp) {
      expect(globalLog[0].salt).toEqual(`test-${exp}`)
    }

    validateSegments = function(namespace, segmentBreakdown) {
      var segments = Object.keys(namespace.segmentAllocations);
      var segCounts = {};
      for (var i = 0; i < segments.length; i++) {
        var seg = namespace.segmentAllocations[segments[i]];
        if (!segCounts[seg]) {
          segCounts[seg] = 1;
        } else {
          segCounts[seg] += 1;
        }
      }
      expect(segCounts).toEqual(segmentBreakdown);
    }
  });

  afterEach(function() {
    globalLog = [];
  });

  it('Adds segment correctly', function() {
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'blah'});
    expect(namespace.get('test')).toEqual(1);
    expect(namespace.availableSegments.length).toEqual(0);
    expect(Object.keys(namespace.segmentAllocations).length).toEqual(100);
    validateLog("Experiment1");
    validateSegments(namespace, { Experiment1: 100 });
  });

  it('Adds segment correctly (compat)', function() {
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'blah'});
    expect(namespace.get('test')).toEqual(1);
    expect(namespace.availableSegments.length).toEqual(0);
    expect(Object.keys(namespace.segmentAllocations).length).toEqual(100);
    validateLog("Experiment1");
    validateSegments(namespace, { Experiment1: 100 });
  });

  it('Adds two segments correctly', function() {
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 50);
        this.addExperiment('Experiment2', Experiment2, 50);
      }
    };

    var namespace = new TestNamespace({'userid': 'blah'});
    expect(namespace.get('test')).toEqual(1);
    validateLog("Experiment1");
    globalLog = [];
    var namespace2 = new TestNamespace({'userid': 'abb'});
    expect(namespace2.get('test')).toEqual(2);
    validateLog("Experiment2");
    var segValidation = { Experiment1: 50, Experiment2: 50};
    validateSegments(namespace, segValidation);

    expect(new TestNamespace({'userid': 'a'}).get('test')).toEqual(1);
    expect(new TestNamespace({'userid': 'b'}).get('test')).toEqual(1);
    expect(new TestNamespace({'userid': 'c'}).get('test')).toEqual(2);
    expect(new TestNamespace({'userid': 'd'}).get('test')).toEqual(1);
    expect(new TestNamespace({'userid': 'e'}).get('test')).toEqual(2);
  });

  it('Adds two segments correctly (compat)', function() {
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 50);
        this.addExperiment('Experiment2', Experiment2, 50);
      }
    };

    var namespace = new TestNamespace({'userid': 'blah'});
    expect(namespace.get('test')).toEqual(1);
    validateLog("Experiment1");
    globalLog = [];
    var namespace2 = new TestNamespace({'userid': 'abb'});
    expect(namespace2.get('test')).toEqual(2);
    validateLog("Experiment2");
    var segValidation = { Experiment1: 50, Experiment2: 50};
    validateSegments(namespace, segValidation);

    expect(new TestNamespace({'userid': 'a'}).get('test')).toEqual(2);
    expect(new TestNamespace({'userid': 'b'}).get('test')).toEqual(2);
    expect(new TestNamespace({'userid': 'c'}).get('test')).toEqual(1);
    expect(new TestNamespace({'userid': 'd'}).get('test')).toEqual(2);
    expect(new TestNamespace({'userid': 'e'}).get('test')).toEqual(2);
  });

  it('Can remove segment correctly', function() {
    class TestNamespace extends BaseTestNamespace {
      setupDefaults() {
        this.numSegments = 10;
      }

      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 10);
        this.removeExperiment('Experiment1');
        this.addExperiment('Experiment2', Experiment2, 10);
      }
    };

    var str = "bla";
    for(var i = 0; i < 100; i++) {
      str += "h";
      var namespace = new TestNamespace({'userid': str});
      expect(namespace.get('test')).toEqual(2);
      validateLog("Experiment2");
    }
    var namespace = new TestNamespace({'userid': str});
    validateSegments(namespace, { Experiment2: 10 });
  });

  it('Can remove segment correctly (compat)', function() {
    class TestNamespace extends BaseTestNamespaceCompat {
      setupDefaults() {
        this.numSegments = 10;
      }

      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 10);
        this.removeExperiment('Experiment1');
        this.addExperiment('Experiment2', Experiment2, 10);
      }
    };

    var str = "bla";
    for(var i = 0; i < 100; i++) {
      str += "h";
      var namespace = new TestNamespace({'userid': str});
      expect(namespace.get('test')).toEqual(2);
      validateLog("Experiment2");
    }
    var namespace = new TestNamespace({'userid': str});
    validateSegments(namespace, { Experiment2: 10 });
  });

  it('Should only log exposure when user could be in experiment', function() {
    class TestNamespace extends BaseTestNamespace {
      setupDefaults() {
        this.numSegments = 10;
      }

      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 5);
        this.addExperiment('Experiment3', Experiment3, 5);
      }
    }

    var namespace = new TestNamespace({'userid': 'hi'});
    expect(namespace.get('test2')).toEqual(3);
    expect(globalLog.length).toEqual(1);
    expect(namespace.get('test')).toBeUndefined();
    validateLog("Experiment3");
  });

  it('Should only log exposure when user could be in experiment (compat)', function() {
    class TestNamespace extends BaseTestNamespaceCompat {
      setupDefaults() {
        this.numSegments = 10;
      }

      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 5);
        this.addExperiment('Experiment3', Experiment3, 5);
      }
    }

    var namespace = new TestNamespace({'userid': 'hi'});
    expect(namespace.get('test')).toEqual(1);
    expect(globalLog.length).toEqual(1);
    expect(namespace.get('test2')).toBeUndefined();
    validateLog("Experiment1");
  });

  it('Allow experiment overrides in SimpleNamespace', function() {
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 50);
        this.addExperiment('Experiment3', Experiment3, 50);
      }

      allowedOverride() {
        return true;
      }

      getOverrides() {
        return {
          'test': {
            'experimentName': 'Experiment1',
            'value': 'overridden'
          },
          'test2': {
            'experimentName': 'Experiment3',
            'value': 'overridden2'
          }
        };
      }
    }

    var namespace = new TestNamespace({'userid': 'hi'});
    expect(namespace.get('test')).toEqual('overridden');
    validateLog('Experiment1');
    globalLog = [];
    expect(namespace.get('test2')).toEqual('overridden2');
    validateLog('Experiment3');
  });

  it('Allow experiment overrides in SimpleNamespace (compat)', function() {
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 50);
        this.addExperiment('Experiment3', Experiment3, 50);
      }

      allowedOverride() {
        return true;
      }

      getOverrides() {
        return {
          'test': {
            'experimentName': 'Experiment1',
            'value': 'overridden'
          },
          'test2': {
            'experimentName': 'Experiment3',
            'value': 'overridden2'
          }
        };
      }
    }

    var namespace = new TestNamespace({'userid': 'hi'});
    expect(namespace.get('test')).toEqual('overridden');
    validateLog('Experiment1');
    globalLog = [];
    expect(namespace.get('test2')).toEqual('overridden2');
    validateLog('Experiment3');
  });

  it('should respect auto exposure logging being set to off', function() {
    class ExperimentNoExposure extends BaseExperiment {
      setup() {
        this.setAutoExposureLogging(false);
        this.name = 'test_name';
      }

      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('ExperimentNoExposure', ExperimentNoExposure, 100);
      }
    };

    var namespace = new TestNamespace({'userid': 'hi'});
    namespace.get('test');
    expect(globalLog.length).toEqual(0);
  });

  it('should respect auto exposure logging being set to off (compat)', function() {
    class ExperimentNoExposure extends BaseExperimentCompat {
      setup() {
        this.setAutoExposureLogging(false);
        this.name = 'test_name';
      }

      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('ExperimentNoExposure', ExperimentNoExposure, 100);
      }
    };

    var namespace = new TestNamespace({'userid': 'hi'});
    namespace.get('test');
    expect(globalLog.length).toEqual(0);
  });

  it('should respect dynamic getParamNames', function() {
    class ExperimentParamTest extends Experiment1 {

      assign(params, args) {
        let clonedArgs = Utils.shallowCopy(args);
        delete clonedArgs.userid;
        let keys = Object.keys(clonedArgs);
        Utils.forEach(keys, function(key) {
          params.set(key, 1);
        });
      }

      getParamNames() {
        return ['foo', 'bar'];
      }
    };
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('ExperimentParamTest', ExperimentParamTest, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    namespace.get('test');
    expect(globalLog.length).toEqual(0);
    namespace.get('foo');
    expect(globalLog.length).toEqual(1);
  });

  it('should respect dynamic getParamNames (compat)', function() {
    class ExperimentParamTest extends Experiment1Compat {

      assign(params, args) {
        let clonedArgs = Utils.shallowCopy(args);
        delete clonedArgs.userid;
        let keys = Object.keys(clonedArgs);
        Utils.forEach(keys, function(key) {
          params.set(key, 1);
        });
      }

      getParamNames() {
        return ['foo', 'bar'];
      }
    };
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('ExperimentParamTest', ExperimentParamTest, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    namespace.get('test');
    expect(globalLog.length).toEqual(0);
    namespace.get('foo');
    expect(globalLog.length).toEqual(1);
  });

  it('should work with getParams', () => {
    class SimpleExperiment extends BaseExperiment {
      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace2 extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        return;
      }
    }
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    namespace.getParams('SimpleExperiment');
    expect(globalLog.length).toEqual(0);
    var namespace2 = new TestNamespace2({'userid': 'hi', 'foo': 1, 'bar': 1});
    var params = namespace2.getParams('SimpleExperiment');
    expect(globalLog.length).toEqual(1);
    expect(params).toEqual({'test': 1});
  });

  it('should work with getParams (compat)', () => {
    class SimpleExperiment extends BaseExperimentCompat {
      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace2 extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        return;
      }
    }
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    namespace.getParams('SimpleExperiment');
    expect(globalLog.length).toEqual(0);
    var namespace2 = new TestNamespace2({'userid': 'hi', 'foo': 1, 'bar': 1});
    var params = namespace2.getParams('SimpleExperiment');
    expect(globalLog.length).toEqual(1);
    expect(params).toEqual({'test': 1});
  });

  it('should only log exposure if "get" is called on a valid param', function() {
    class SimpleExperiment extends BaseExperiment {
      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    namespace.get('foobar');
    expect(globalLog.length).toEqual(0);
    expect(namespace.get('test')).toBe(1);
    expect(globalLog.length).toEqual(1);
  });

  it('should only log exposure if "get" is called on a valid param (compat)', function() {
    class SimpleExperiment extends BaseExperimentCompat {
      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    namespace.get('foobar');
    expect(globalLog.length).toEqual(0);
    expect(namespace.get('test')).toBe(1);
    expect(globalLog.length).toEqual(1);
  });

  it('should return default value if provided and "get" is called on an invalid param', function() {
    class SimpleExperiment extends BaseExperiment {
      assign(params, args) {
        params.set('test', 1)
        params.set('test_undefined', undefined)
        params.set('test_null', null)
      }
    };
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    expect(namespace.get('foobar', 'boom')).toEqual('boom');
    expect(namespace.get('test_undefined', 'boom')).toEqual('boom');
    expect(namespace.get('test_null', 'boom')).toEqual('boom');
  });

  it('should return default value if provided and "get" is called on an invalid param (compat)',
      function() {
    class SimpleExperiment extends BaseExperimentCompat {
      assign(params, args) {
        params.set('test', 1)
        params.set('test_undefined', undefined)
        params.set('test_null', null)
      }
    };
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    var namespace = new TestNamespace({'userid': 'hi', 'foo': 1, 'bar': 1});
    expect(namespace.get('foobar', 'boom')).toEqual('boom');
    expect(namespace.get('test_undefined', 'boom')).toEqual('boom');
    expect(namespace.get('test_null', 'boom')).toEqual('boom');
  });

  it('should work with experiment setup', function() {
    class SimpleExperiment extends BaseExperiment {
      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace extends BaseTestNamespace {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    var namespace = new TestNamespace({'foo': 1, 'bar': 1});
    ExperimentSetup.registerExperimentInput('userid', 'hi');
    expect(namespace.get('test')).toBe(1);
    expect(globalLog.length).toEqual(1);
  });

  it('should work with experiment setup (compat)', function() {
    class SimpleExperiment extends BaseExperimentCompat {
      assign(params, args) {
        params.set('test', 1)
      }
    };
    class TestNamespace extends BaseTestNamespaceCompat {
      setupExperiments() {
        this.addExperiment('SimpleExperiment', SimpleExperiment, 100);
      }
    };
    var namespace = new TestNamespace({'foo': 1, 'bar': 1});
    ExperimentSetupCompat.registerExperimentInput('userid', 'hi');
    expect(namespace.get('test')).toBe(1);
    expect(globalLog.length).toEqual(1);
  });

  it('actually works', function() {
    class TestNamespaces extends BaseTestNamespace {
      setup() {
        this.setName('testomg');
        this.setPrimaryUnit('userid');
      }

      setupDefaults() {
        this.numSegments = 10;
      }

      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 6);
      }
    }

    var count = 0;
    var total = 10000;
    for (var i = 0; i < total; i++) {
      ExperimentSetup.registerExperimentInput('userid', i);
      var n = new TestNamespaces();
      if (n.get('test')) {
        count += 1;
      }
    }
    expect(count >= 5500 && count <= 6500).toBe(true);
  });

  it('actually works (compat)', function() {
    class TestNamespaces extends BaseTestNamespaceCompat {
      setup() {
        this.setName('testomg');
        this.setPrimaryUnit('userid');
      }

      setupDefaults() {
        this.numSegments = 10;
      }

      setupExperiments() {
        this.addExperiment('Experiment1', Experiment1, 6);
      }
    }

    var count = 0;
    var total = 10000;
    for (var i = 0; i < total; i++) {
      ExperimentSetupCompat.registerExperimentInput('userid', i);
      var n = new TestNamespaces();
      if (n.get('test')) {
        count += 1;
      }
    }
    expect(count >= 5500 && count <= 6500).toBe(true);
  });
});

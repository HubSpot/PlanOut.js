import { forEach } from "../lib/utils";

class PlanOutOp {

  constructor(args) {
    this.args = args;
  }

  execute(mapper) {
    throw "Implement the execute function";
  }

  dumpArgs() {
    console.log(this.args);
  }

  getArgMixed(name) {
    if (this.args[name] === undefined) {
      throw ("Missing argument " + name);
    }
    return this.args[name];
  }


  getArgNumber(name) {
    var cur = this.getArgMixed(name);
    if (typeof(cur) !== "number") {
      throw (name + " is not a number.")
    }
    return cur;
  }

  getArgString(name) {
    var cur = this.getArgMixed(name);
    if (typeof(cur) !== "string") {
      throw (name + " is not a string.")
    }
    return cur;
  }

  getArgList(name) {
    var cur = this.getArgMixed(name);
    if (Object.prototype.toString.call( cur ) !== '[object Array]') {
      throw (name + " is not a list");
    }
    return cur;
  }

  getArgObject(name) {
    var cur = this.getArgMixed(name);
    if (Object.prototype.toString.call( cur ) !== '[object Object]') {
      throw (name + " is not an object.")
    }
    return cur;
  }

  getArgIndexish(name) {
    var cur = this.getArgMixed(name);
    var type = Object.prototype.toString.call( cur );
    if (type !== '[object Object]' && type !== '[object Array]') {
      throw (name + " is not an list or object.")
    }
    return cur;
  }
};

class PlanOutOpSimple extends PlanOutOp {

  execute(mapper) {
    this.mapper = mapper;
    var self = this;
    forEach(Object.keys(this.args), function (key) {
      self.args[key] = mapper.evaluate(self.args[key]);
    });
    return this.simpleExecute();
  }
}

class PlanOutOpUnary extends PlanOutOpSimple {
  simpleExecute() {
    return this.unaryExecute(this.getArgMixed('value'));
  }
  getUnaryString() {
    return this.args.op;
  }
  unaryExecute(value) {
    throw "implement unaryExecute";
  }
}

class PlanOutOpBinary extends PlanOutOpSimple {
  simpleExecute() {
    var left = this.getArgMixed('left');
    var right = this.getArgMixed('right');
    return this.binaryExecute(left, right);
  }

  getInfixString() {
    return this.args.op;
  }

  binaryExecute(left, right) {
    throw "implement binaryExecute";
  }
}

class PlanOutOpCommutative extends PlanOutOpSimple {
  simpleExecute() {
    return this.commutativeExecute(this.getArgList('values'));
  }

  getCommutativeString() {
    return this.args.op;
  }

  commutativeExecute(values) {
    throw "implement commutativeExecute";
  }
}

export { PlanOutOp, PlanOutOpSimple, PlanOutOpCommutative, PlanOutOpBinary, PlanOutOpUnary };

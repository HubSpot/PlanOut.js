import {PlanOutOp, PlanOutOpSimple, PlanOutOpBinary, PlanOutOpUnary, PlanOutOpCommutative} from "./base";
import {isOperator, StopPlanOutException} from "./utils";
import { map, forEach, reduce, deepCopy } from '../lib/utils'

class Literal extends PlanOutOp {
  execute(mapper) {
    return this.getArgMixed('value');
  }
}

class Get extends PlanOutOp {
  execute(mapper) {
    return mapper.get(this.getArgString('var'));
  }
}

class Seq extends PlanOutOp {
  execute(mapper) {
    forEach(this.getArgList('seq'), function(op) {
      mapper.evaluate(op);
    });
  }
}


class Return extends PlanOutOp {
  execute(mapper) {
    var value = mapper.evaluate(this.getArgMixed('value'));
    var inExperiment = false;
    if(value) {
      inExperiment = true;
    }
    throw new StopPlanOutException(inExperiment);
  }
}


class Set extends PlanOutOp {
  execute(mapper) {
    let variable = this.getArgString('var');
    let value = this.getArgMixed('value');

    if (mapper.hasOverride(variable)) {
      return;
    }

    if (value && isOperator(value) && !value.salt) {
      value.salt = variable;
    }

    if (variable == "experimentSalt") {
      mapper.experimentSalt = value;
    }

    mapper.set(variable, mapper.evaluate(value));
  }
}

class Arr extends PlanOutOp {
  execute(mapper) {
    return map(this.getArgList('values'), function(value) {
      return mapper.evaluate(value);
    });
  }
}

class Coalesce extends PlanOutOp {
  execute(mapper) {
    var values = this.getArgList('values');
    for(var i = 0; i < values.length; i++) {
      var x = values[i];
      var evalX = mapper.evaluate(x);
      if (evalX !== null && evalX !== undefined) {
        return evalX;
      }
    }
    return null;
  }
}

class Index extends PlanOutOpSimple {
  simpleExecute() {
    var base = this.getArgIndexish('base');
    var index = this.getArgMixed('index');
    if (typeof(index) === "number") {
      if (index >=0 && index < base.length) {
        return base[index];
      } else {
        return undefined;
      }
    } else {
      return base[index];
    }
  }
}

class Cond extends PlanOutOp {
  execute(mapper) {
    let list = this.getArgList('cond');
    for (let i in list) {
      var ifClause = list[i]['if'];
      var thenClause = list[i]['then'];
      if (mapper.evaluate(ifClause)) {
        return mapper.evaluate(thenClause);
      }
    }
    return null;
  }
}

class And extends PlanOutOp {
  execute(mapper) {
    return reduce(this.getArgList('values'), function(ret, clause) {
      if (!ret) { return ret; }

      return Boolean(mapper.evaluate(clause));
    }, true);
  }
}

class Or extends PlanOutOp {
  execute(mapper) {
    return reduce(this.getArgList('values'), function(ret, clause) {
      if (ret) { return ret; }

      return Boolean(mapper.evaluate(clause));
    }, false);
  }
}

class Product extends PlanOutOpCommutative {
  commutativeExecute(values) {
    return reduce(values, function(memo, value) {
      return memo * value;
    }, 1);
  }
}

class Sum extends PlanOutOpCommutative {
  commutativeExecute(values) {
    return reduce(values, function(memo, value) {
      return memo + value;
    }, 0);
  }
}

class Equals extends PlanOutOpBinary {
  getInfixString() {
    return "==";
  }

  binaryExecute(left, right) {
    return left === right;
  }
}

class GreaterThan extends PlanOutOpBinary {
  binaryExecute(left, right) {
    return left > right;
  }
}

class LessThan extends PlanOutOpBinary {
  binaryExecute(left, right) {
    return left < right;
  }
}

class LessThanOrEqualTo extends PlanOutOpBinary {
  binaryExecute(left, right) {
    return left<= right;
  }
}

class GreaterThanOrEqualTo extends PlanOutOpBinary {
  binaryExecute(left, right) {
    return left >= right;
  }
}

class Mod extends PlanOutOpBinary {
  binaryExecute(left, right) {
    return left % right;
  }
}

class Divide extends PlanOutOpBinary {
  binaryExecute(left, right) {
    return parseFloat(left) / parseFloat(right);
  }
}

class Round extends PlanOutOpUnary {
  unaryExecute(value) {
    return Math.round(value);
  }
}

class Exp extends PlanOutOpUnary {
  unaryExecute(value) {
    return Math.exp(value);
  }
}

class Sqrt extends PlanOutOpUnary {
  unaryExecute(value) {
    return Math.sqrt(value);
  }
}

class Not extends PlanOutOpUnary {
  getUnaryString() {
    return '!';
  }

  unaryExecute(value) {
    return !value;
  }
}


class Negative extends PlanOutOpUnary {
  getUnaryString() {
    return '-';
  }

  unaryExecute(value) {
    return  0 - value;
  }
}

class Min extends PlanOutOpCommutative {
  commutativeExecute(values) {
    return Math.min.apply(null, values);
  }
}

class Max extends PlanOutOpCommutative {
  commutativeExecute(values) {
    return Math.max.apply(null, values);
  }
}

class Length extends PlanOutOpUnary {
  unaryExecute(value) {
    return value.length;
  }
}

class Map extends PlanOutOpSimple {
  simpleExecute() {
    let copy = deepCopy(this.args);
    delete copy.op;
    delete copy.salt;
    return copy;
  }
}

export { Literal, Get, Seq, Set, Arr, Map, Coalesce, Index, Cond, And, Or, Product, Sum, Equals, GreaterThan, LessThan, LessThanOrEqualTo, GreaterThanOrEqualTo, Mod, Divide, Round, Exp, Sqrt, Not, Negative, Min, Max, Length, Return };

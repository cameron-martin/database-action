/// <reference types="node" />

import * as sinon from 'sinon';
import { expect } from 'chai';
import * as jsc from 'jsverify';

import { DbAction, Transaction } from '../';

const arbitraryUnitDbAction = <T>(contentArbitrary: jsc.Arbitrary<T>) => jsc.bless({
  generator: contentArbitrary.generator.map(x => DbAction.resolve(x)),
  shrink: jsc.shrink.bless<DbAction<T>>(val => []),
  show: (val: DbAction<T>) => 'Some DbAction'
});

const fakeTransaction: Transaction = {
  execute: () => Promise.resolve(1)
}

/**
* A DbAction is equivalent if executing it produces the same result,
* and the same side effects, i.e. calls to transaction's execute method.
*/
function dbActionEquivalent<T>(action1: DbAction<T>, action2: DbAction<T>): Promise<boolean> {
  const results = [
    action1, action2
  ].map(action => action.execute(fakeTransaction));

  return Promise.all(results).then(([result1, result2]) => result1 === result2);
}

const dbActionArbitrary = arbitraryUnitDbAction(jsc.number);

suite('Algebraic properties', function() {
  suite('Functor', function() {
    test('identity', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, function(dbAction) {
        return dbActionEquivalent(dbAction.map(x => x), dbAction);
      }));
    });

    test('composition', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, jsc.fn(jsc.number), jsc.fn(jsc.number), function(dbAction, f, g) {
        return dbActionEquivalent(dbAction.map(f).map(g), dbAction.map(x => g(f(x))));
      }));
    });
  });
});

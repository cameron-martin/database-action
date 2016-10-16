// @flow
import sinon from 'sinon';
import { expect } from 'chai';
import { suite, setup, test } from 'mocha';
import jsc from 'jsverify';

import { DbAction } from '../index.js';
import type { Transaction } from '../index.js';

const arbitraryUnitDbAction = (contentArbitrary) => ({
  generator: contentArbitrary.generator.map(x => DbAction.of(x)),
  shrink: jsc.shrink.bless(val => []),
  show: val => 'Some DbAction'
});

const fakeTransaction: Transaction<any> = {
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
      jsc.assert(jsc.forall(dbActionArbitrary, function(dbAction) {
        return dbActionEquivalent(dbAction.map(x => x), dbAction);
      }));
    });

    test('composition', function() {
      jsc.assert(jsc.forall(dbActionArbitrary, jsc.fn(jsc.number), jsc.fn(jsc.number), function(dbAction, f, g) {
        return dbActionEquivalent(dbAction.map(f).map(g), dbAction.map(x => f(g(x))));
      }));
    });
  });
});

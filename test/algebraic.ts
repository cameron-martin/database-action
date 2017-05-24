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
  // https://github.com/fantasyland/fantasy-land#functor
  suite('Functor', function() {
    test('identity', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, function(dbAction) {
        return dbActionEquivalent(
          dbAction.map(x => x),
          dbAction
        );
      }));
    });

    test('composition', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, jsc.fn(jsc.number), jsc.fn(jsc.number), function(dbAction, f, g) {
        return dbActionEquivalent(
          dbAction.map(f).map(g),
          dbAction.map(x => g(f(x)))
        );
      }));
    });
  });

  // https://github.com/fantasyland/fantasy-land#apply
  suite('Apply', function() {
    // test('composition', function() {
    //   return jsc.assert(jsc.forall(dbActionArbitrary, arbitraryUnitDbAction(jsc.fn(jsc.number)), arbitraryUnitDbAction(jsc.fn(jsc.number)), function(v, u, a) {
    //     return dbActionEquivalent(
    //       v.ap(u.ap(a.map(f => (g: (x: number) => any) => (x: any): any => f(g(x))))),
    //       v.ap(u).ap(a)
    //     );
    //   }));
    // });
  });

  suite('Applicative', function() {
    test('identity', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, function(v) {
        return dbActionEquivalent(
          v.ap<number>(DbAction.of((x: number) => x)),
          v
        );
      }));
    });

    test('homomorphism', function() {
      return jsc.assert(jsc.forall(jsc.number, jsc.fn(jsc.number), function(x, f) {
        return dbActionEquivalent(
          DbAction.of(x).ap(DbAction.of(f)),
          DbAction.of(f(x))
        );
      }));
    });

    test('interchange', function() {
      return jsc.assert(jsc.forall(jsc.number, arbitraryUnitDbAction(jsc.fn(jsc.number)), function(y, u) {
        return dbActionEquivalent(
          DbAction.of(y).ap(u),
          u.ap(DbAction.of((f: (x: number) => number) => f(y)))
        );
      }));
    });
  });
  
  suite('Chain', function() {
    test('associativity', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, jsc.fn(dbActionArbitrary), jsc.fn(dbActionArbitrary), function(m, f, g) {
        return dbActionEquivalent(
          m.chain(f).chain(g),
          m.chain(x => f(x).chain(g))
        );
      }));
    });
  });

  suite('Monad', function() {
    test('left identity', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, jsc.fn(dbActionArbitrary), function(a, f) {
        return dbActionEquivalent(
          DbAction.of(a).chain(f),
          f(a)
        );
      }));
    });

    test('right identity', function() {
      return jsc.assert(jsc.forall(dbActionArbitrary, jsc.fn(dbActionArbitrary), function(m) {
        return dbActionEquivalent(
          m.chain(DbAction.of.bind(DbAction)), // TODO: Maybe autobind the static methods
          m
        );
      }));
    });
  });
});

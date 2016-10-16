// @flow
import sinon from 'sinon';
import { expect } from 'chai';
import { suite, setup, test } from 'mocha';

import { DbAction } from '../index.js';
import type { Transaction } from '../index.js';

function createTransaction<T>(): Transaction<T> {
  return {
    execute: sinon.stub()
  };
}

function cartesianProduct(a) { // a = array of array
    var i, j, l, m, a1, o = [];
    if (!a || a.length == 0) return a;

    a1 = a.splice(0, 1)[0]; // the first array of a
    a = cartesianProduct(a);
    for (i = 0, l = a1.length; i < l; i++) {
        if (a && a.length) for (j = 0, m = a.length; j < m; j++)
            o.push([a1[i]].concat(a[j]));
        else
            o.push([a1[i]]);
    }
    return o;
}

suite('DbAction', function() {
  [1, {}, 'something'].forEach(x => {
    test('values created using .of execute to the correct value (' + JSON.stringify(x) + ')', function() {
      const transaction = createTransaction();
      const dbAction = DbAction.of(x);

      return dbAction.execute(transaction).then(result => {
        expect(result).to.eq(x);
      });
    });
  });

  test('DbAction created using fromQuery, when executed calls execute on transaction once, then returns the result', function() {
    const transaction = createTransaction();
    transaction.execute.returns(Promise.resolve('foo'));

    const dbAction = DbAction.fromQuery('SOME QUERY');

    return dbAction.execute(transaction).then(result => {
      sinon.assert.calledWithExactly(transaction.execute, 'SOME QUERY');
      sinon.assert.calledOnce(transaction.execute);

      expect(result).to.eq('foo');
    });
  });

  test('map transforms result', function() {
    const transaction = createTransaction();
    const dbAction = DbAction.of(2).map(x => x * 2);

    return dbAction.execute(transaction).then(result => {
      expect(result).to.eq(4);
    });
  });

  test('it is immutable', function() {
    const dbAction = DbAction.of(2);

    expect(dbAction).to.be.frozen;
  });
});

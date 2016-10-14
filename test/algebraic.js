// @flow
import sinon from 'sinon';
import { expect } from 'chai';
import { suite, setup, test } from 'mocha';
import jsc from 'jsverify';

import { DbAction } from '../index.js';

const arbitraryUnitDbAction = (contentArbitrary) => ({
  generator: contentArbitrary.map(x => DbAction.of(x)),
  shrink: jsc.shrink.bless(val => []),
  show: val => 'Some DbAction'
});

suite('Algebraic properties', function() {
  suite('Functor', function() {
    test();
  });
});

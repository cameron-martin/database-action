[![Build Status](https://travis-ci.org/cameron-martin/database-action.svg?branch=master)](https://travis-ci.org/cameron-martin/database-action)
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](http://www.repostatus.org/badges/latest/wip.svg)](http://www.repostatus.org/#wip)
[![dependencies Status](https://david-dm.org/cameron-martin/database-action/status.svg)](https://david-dm.org/cameron-martin/database-action)
[![Join the chat at https://gitter.im/cameron-martin/database-action](https://badges.gitter.im/cameron-martin/database-action.svg)](https://gitter.im/cameron-martin/database-action?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# database-action

## The problem

Working with WebSQL and IndexedDB is a bit of a nightmare, because:
    
* Their APIs are asynchronous, but they don't use promises. Furthermore, creating a promise-returning interface is impossible due to a combintion of WebSQL and IndexedDB's "auto committing transactions" and [section 2.2.4 of the Promise/A+ spec][promise-violation]. Unless you're on some browsers, that queue Promise callbacks as microtasks, or something. [TODO: Put information here about which browsers this works in].
* Even if you manage to give it a promise interface and you want your functions/methods which run queries to be composable (i.e. have function/method which uses them, and have it all run in the same transaction), then you have to manually thread a transaction variable through your program.
* No methods are provided to manually roll back a transaction.

## The solution

* Create a type that represents a _database action_, that when ran will perform a some database queries and return a result.
* Give this type a monad, applicative, functor interface.


## Design Goals

* To have a promise-like interface (enough to be able to use async/await syntax).
* To be [fantasy land][fantasy-land] compliant.
* To be as compatible with Promise/A+ spec as possible.
* Provide a fake transaction for unit testing.

## TODO

* Set up greenkeeper.
* Add pre-packaged "globals" builds.
* Make the test's tsconfig.json work properly.
* Finish the library.
* Publish to NPM.

[promise-violation]: https://promisesaplus.com/#point-34
[fantasy-land]: https://github.com/fantasyland/fantasy-land
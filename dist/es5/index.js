"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DbAction = exports.DbAction = function () {
    function DbAction(action) {
        _classCallCheck(this, DbAction);

        this._action = action;
        Object.freeze(this);
    }

    _createClass(DbAction, [{
        key: "execute",
        value: function execute(tx) {
            return this._action(tx);
        }
    }, {
        key: "map",
        value: function map(f) {
            var _this = this;

            return new DbAction(function (tx) {
                return _this.execute(tx).then(f);
            });
        }
    }, {
        key: "ap",
        value: function ap(f) {
            var _this2 = this;

            return new DbAction(function (tx) {
                return f.execute(tx).then(function (f) {
                    return _this2.execute(tx).then(f);
                });
            });
        }
    }, {
        key: "chain",
        value: function chain(f) {
            var _this3 = this;

            return new DbAction(function (tx) {
                return _this3.execute(tx).then(function (t) {
                    return f(t).execute(tx);
                });
            });
        }
    }], [{
        key: "fromQuery",
        value: function fromQuery(query) {
            return new this(function (tx) {
                return tx.execute(query);
            });
        }
    }, {
        key: "resolve",
        value: function resolve(x) {
            return new this(function (tx) {
                return Promise.resolve(x);
            });
        }
    }, {
        key: "of",
        value: function of(x) {
            return this.resolve(x);
        }
    }, {
        key: "reject",
        value: function reject(x) {
            return new DbAction(function (tx) {
                return Promise.reject(x);
            });
        }
    }]);

    return DbAction;
}();
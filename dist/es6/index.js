export class DbAction {
    constructor(action) {
        this._action = action;
        Object.freeze(this);
    }
    static fromQuery(query) {
        return new this((tx) => tx.execute(query));
    }
    static resolve(x) {
        return new this((tx) => Promise.resolve(x));
    }
    static reject(x) {
        return new DbAction(tx => Promise.reject(x));
    }
    execute(tx) {
        return this._action(tx);
    }
    map(f) {
        return new DbAction(tx => {
            return this.execute(tx).then(f);
        });
    }
}

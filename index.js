// @flow
export type Transaction<T> = {
  execute(query: string): Promise<T>;
}

export type Executer<T> = {
  execute(): Promise<T>;
}

export class DbAction<T> {
  _action: (tx: Transaction<T>) => Promise<T>;

  static fromQuery(query: string) {
    return new this((tx) => tx.execute(query));
  }

  static of(x: T): DbAction<T> {
    return new this((tx) => Promise.resolve(x));
  }

  constructor(action: (tx: Transaction<T>) => Promise<T>) {
    this._action = action;

    Object.freeze(this);
  }

  execute(tx: Transaction<T>): Promise<T> {
    return this._action(tx);
  }

  map<R>(f: (x: T) => R): DbAction<R> {
    return new DbAction(tx => {
      return this.execute(tx).then(f);
    });
  }
}

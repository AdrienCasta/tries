export type Success<T> = { success: true; value: T };

export type Failure<E = Error> = { success: false; error: E };

export type Result<T, E = Error> = Success<T> | Failure<E>;

export const Result = {
  ok<T, E = Error>(value: T): Result<T, E> {
    return { success: true, value };
  },

  fail<T, E = Error>(error: E): Result<T, E> {
    return { success: false, error };
  },

  isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success === true;
  },

  isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
    return result.success === false;
  },

  combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];

    for (const result of results) {
      if (Result.isFailure(result)) {
        return Result.fail(result.error);
      }
      values.push(result.value);
    }

    return Result.ok(values);
  },

  combineObject<T extends Record<string, Result<any, any>>>(
    results: T
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer V, any> ? V : never },
    T[keyof T] extends Result<any, infer E> ? E : never
  > {
    const values: any = {};

    for (const key in results) {
      const result = results[key];
      if (Result.isFailure(result)) {
        return Result.fail(result.error) as any;
      }
      values[key] = result.value;
    }

    return Result.ok(values);
  },
};

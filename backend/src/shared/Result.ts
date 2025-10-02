export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export const Result = {
  ok<T, E = Error>(value: T): Result<T, E> {
    return { success: true, value };
  },

  fail<T, E = Error>(error: E): Result<T, E> {
    return { success: false, error };
  },

  isSuccess<T, E>(result: Result<T, E>): result is { success: true; value: T } {
    return result.success === true;
  },

  isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return result.success === false;
  },
};

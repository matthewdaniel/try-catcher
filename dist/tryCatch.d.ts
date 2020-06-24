/**
 * Not for extension, just for tricking typescript
 */
declare class BaseError extends Error {
    constructor();
}
interface Catcher<T> {
    type: 'catcher';
    errorType: (typeof BaseError | typeof Error);
    handler: <T2>(e: T2) => T;
}
interface FinallyType<T> {
    type: 'finally';
    handler: (e?: Error) => T;
}
export declare const Catch: <T extends typeof BaseError | ErrorConstructor, T2>(e: T, handler: (e: InstanceType<T>) => T2) => Catcher<T2>;
export declare const Finally: <T>(handler: (e?: Error | undefined) => any) => FinallyType<T>;
export declare const isPromise: <T>(maybePromise: any) => maybePromise is Promise<T>;
declare type tryCatchTrier<T> = (() => T) | Promise<T>;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, f?: FinallyType<T>): T | Promise<T>;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, f?: FinallyType<T>): T;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, f?: FinallyType<T>): T;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, f?: FinallyType<T>): T;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, f?: FinallyType<T>): T;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, f?: FinallyType<T>): T;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, c6: Catcher<T>, f?: FinallyType<T>): T;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, c6: Catcher<T>, c7: Catcher<T>, f?: FinallyType<T>): T;
export declare function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, c6: Catcher<T>, c7: Catcher<T>, c8: Catcher<T>, f?: FinallyType<T>): T;
export {};

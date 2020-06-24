/**
 * Not for extension, just for tricking typescript
 */
class BaseError extends Error {
    constructor() {
        super();
    }
}

interface Catcher<T> {
    type: 'catcher',
    errorType: (typeof BaseError | typeof Error);
    handler: <T2>(e: T2) => T;
}

interface FinallyType<T> {
    type: 'finally',
    handler: (e?: Error) => T;
}

type CatchOrFinally<T> = Catcher<T>|FinallyType<T>;

const isCatch = (c:CatchOrFinally<any>): c is Catcher<any> => c.type === 'catcher';
const isFinally = (c: CatchOrFinally<any>): c is FinallyType<any> => c.type === 'finally';

export const Catch = <T extends (typeof BaseError | typeof Error), T2>(e: T, handler: (e: InstanceType<T>) => T2): Catcher<T2> => ({
    type: 'catcher',
    errorType: e,
    handler: <any>handler,
});

export const Finally = <T>(handler: (e?: Error) => any): FinallyType<T> => ({
    type: 'finally',
    handler,
});

export const isPromise = <T>(maybePromise: any): maybePromise is Promise<T> => maybePromise?.then || Object.getPrototypeOf(maybePromise).constructor.name === 'AsyncFunction' || `${maybePromise}`.includes('__awaiter');
type tryCatchTrier<T> = (() => T)|Promise<T>;

const rejectAsErrorThrower = (any: any) => () => {
    if (any instanceof Error) { throw any; };
    if (['string', 'number', 'undefined', 'boolean'].includes(typeof any)) { throw new Error(any); }
    if (any === null) { throw new Error; }
    throw new Error(JSON.stringify(any));
};

const withFinally = async (promise: Promise<any>|((...any: any) => Promise<any>), theFinally?: FinallyType<any>) => {
    try {
        const res = await promise;
        if (theFinally) {
            await theFinally.handler();
        }
        return res;
    } catch (e) {
        throw e;
    } finally {
        if (theFinally) {
            await theFinally.handler();
        }
    }
};

export function tryCatch<T = any>(fn: tryCatchTrier<T>, f?: FinallyType<T>): T|Promise<T>;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, c6: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, c6: Catcher<T>, c7: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, c: Catcher<T>, c2: Catcher<T>, c3: Catcher<T>, c4: Catcher<T>, c5: Catcher<T>, c6: Catcher<T>, c7: Catcher<T>, c8: Catcher<T>, f?: FinallyType<T>): T;
export function tryCatch<T = any>(fn: tryCatchTrier<T>, ...catchers: (any)[]): T|Promise<T> {
    if (isPromise<T>(fn)) {
        const awaiter = (<any>fn)?.then
            ? fn
            : (<any>fn)();

        const finallyFn = catchers.find(isFinally);
        const onlyCatchers = catchers.filter(isCatch);

        return withFinally(awaiter.catch((e: any) => tryCatch(rejectAsErrorThrower(e), ...(onlyCatchers as any))), finallyFn);
    } else {
        const f = <any>catchers.find(isFinally);
        const finallyHandler = f?.handler;

        try {
            const res = fn();
            if (finallyHandler !== undefined) { finallyHandler(); }
            return res;
        } catch (e) {
            try {
                const catchHandler = catchers.filter(isCatch).find(c => e instanceof c.errorType)?.handler;

                if (catchHandler === undefined) {
                    throw e;
                }

                const res = catchHandler(e);
                if (finallyHandler !== undefined) { finallyHandler(e); }
                return res;
            } catch (e2) {
                if (finallyHandler !== undefined) { finallyHandler(e2); }
                throw e2;
            }
        }
    }    
}

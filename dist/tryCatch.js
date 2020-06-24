"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = exports.isPromise = exports.Finally = exports.Catch = void 0;
/**
 * Not for extension, just for tricking typescript
 */
class BaseError extends Error {
    constructor() {
        super();
    }
}
const isCatch = (c) => c.type === 'catcher';
const isFinally = (c) => c.type === 'finally';
exports.Catch = (e, handler) => ({
    type: 'catcher',
    errorType: e,
    handler: handler,
});
exports.Finally = (handler) => ({
    type: 'finally',
    handler,
});
exports.isPromise = (maybePromise) => (maybePromise === null || maybePromise === void 0 ? void 0 : maybePromise.then) || Object.getPrototypeOf(maybePromise).constructor.name === 'AsyncFunction' || `${maybePromise}`.includes('__awaiter');
const rejectAsErrorThrower = (any) => () => {
    if (any instanceof Error) {
        throw any;
    }
    ;
    if (['string', 'number', 'undefined', 'boolean'].includes(typeof any)) {
        throw new Error(any);
    }
    if (any === null) {
        throw new Error;
    }
    throw new Error(JSON.stringify(any));
};
const withFinally = (promise, theFinally) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield promise;
        if (theFinally) {
            yield theFinally.handler();
        }
        return res;
    }
    catch (e) {
        throw e;
    }
    finally {
        if (theFinally) {
            yield theFinally.handler();
        }
    }
});
function tryCatch(fn, ...catchers) {
    var _a, _b;
    if (exports.isPromise(fn)) {
        const awaiter = ((_a = fn) === null || _a === void 0 ? void 0 : _a.then) ? fn
            : fn();
        const finallyFn = catchers.find(isFinally);
        const onlyCatchers = catchers.filter(isCatch);
        return withFinally(awaiter.catch((e) => tryCatch(rejectAsErrorThrower(e), ...onlyCatchers)), finallyFn);
    }
    else {
        const f = catchers.find(isFinally);
        const finallyHandler = f === null || f === void 0 ? void 0 : f.handler;
        try {
            const res = fn();
            if (finallyHandler !== undefined) {
                finallyHandler();
            }
            return res;
        }
        catch (e) {
            try {
                const catchHandler = (_b = catchers.filter(isCatch).find(c => e instanceof c.errorType)) === null || _b === void 0 ? void 0 : _b.handler;
                if (catchHandler === undefined) {
                    throw e;
                }
                const res = catchHandler(e);
                if (finallyHandler !== undefined) {
                    finallyHandler(e);
                }
                return res;
            }
            catch (e2) {
                if (finallyHandler !== undefined) {
                    finallyHandler(e2);
                }
                throw e2;
            }
        }
    }
}
exports.tryCatch = tryCatch;
//# sourceMappingURL=tryCatch.js.map
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
const tryCatch_1 = require("./tryCatch");
describe('try catcher', () => {
    it('should not call catch if no error thrown', () => {
        const catchHandler = jest.fn((e) => { });
        tryCatch_1.tryCatch(() => { }, tryCatch_1.Catch(Error, catchHandler));
        expect(catchHandler).not.toHaveBeenCalled();
    });
    it('should call finally if provided and no error thrown', () => {
        const finallyHandler = jest.fn(() => { });
        tryCatch_1.tryCatch(() => { }, tryCatch_1.Finally(finallyHandler));
        expect(finallyHandler).toHaveBeenCalled();
    });
    it('should call finally when we throw', () => {
        const finallyHandler = jest.fn(() => { });
        try {
            tryCatch_1.tryCatch(() => { throw new Error; }, tryCatch_1.Finally(finallyHandler));
            fail();
        }
        catch (e) {
            expect(finallyHandler).toHaveBeenCalled();
        }
    });
    it('should call catch when we throw general error and swallow error', () => {
        const catcher = jest.fn(() => { });
        tryCatch_1.tryCatch(() => { throw new Error; }, tryCatch_1.Catch(Error, catcher));
        expect(catcher).toHaveBeenCalled();
    });
    it('should throw if catcher throws', () => {
        const catcher = jest.fn(() => {
            throw new Error;
        });
        try {
            tryCatch_1.tryCatch(() => { throw new Error; }, tryCatch_1.Catch(Error, catcher));
            fail();
        }
        catch (e) {
            expect(catcher).toHaveBeenCalled();
        }
    });
    it('should throw if finally throws', () => {
        const finallyHandler = jest.fn(() => { throw Error('test'); });
        try {
            tryCatch_1.tryCatch(() => { }, tryCatch_1.Finally(finallyHandler));
            fail();
        }
        catch (e) {
            expect(finallyHandler).toHaveBeenCalled();
        }
    });
    it('should hit finally when a Catcher throws', () => {
        const finallyHandler = jest.fn(() => { });
        try {
            tryCatch_1.tryCatch(() => { throw new Error; }, tryCatch_1.Catch(Error, (e) => { throw new Error; }), tryCatch_1.Finally(finallyHandler));
            fail();
        }
        catch (e) {
            expect(finallyHandler).toHaveBeenCalled();
        }
    });
    it('should return result of trier', () => {
        expect(tryCatch_1.tryCatch(() => 'test')).toBe('test');
    });
    it('should not return the result of finally when no error thrown', () => {
        const res = tryCatch_1.tryCatch(() => 'test', tryCatch_1.Finally(() => 'test1'));
        expect(res).toBe('test');
    });
    it('should return result of catcher', () => {
        const res = tryCatch_1.tryCatch(() => { throw new Error; }, tryCatch_1.Catch(Error, () => 'test'));
        expect(res).toBe('test');
    });
    it('should resolve promise', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield tryCatch_1.tryCatch(Promise.resolve('test'));
        expect(result).toBe('test');
    }));
    it('should return result of catch promise on throw', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield tryCatch_1.tryCatch(new Promise(res => { throw new Error; }), tryCatch_1.Catch(Error, e => Promise.resolve('test')));
        expect(result).toBe('test');
    }));
    it('should wrap rejects inside error', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield tryCatch_1.tryCatch(Promise.reject(), tryCatch_1.Catch(Error, e => Promise.resolve('test')));
        expect(result).toBe('test');
    }));
    it('should support async function', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield tryCatch_1.tryCatch((() => __awaiter(void 0, void 0, void 0, function* () {
            const first = yield Promise.resolve(1);
            const second = yield Promise.resolve(2);
            return Promise.resolve(3);
        }))());
        expect(res).toBe(3);
    }));
    it('it should await finally', () => __awaiter(void 0, void 0, void 0, function* () {
        let finallyResolved = false;
        try {
            yield tryCatch_1.tryCatch(Promise.reject(), tryCatch_1.Finally(() => __awaiter(void 0, void 0, void 0, function* () {
                yield new Promise(res => setTimeout(res, 1));
                finallyResolved = true;
            })));
            fail();
        }
        catch (e) { }
        expect(finallyResolved).toBeTruthy();
    }));
    it('should await catcher when catcher throws', () => __awaiter(void 0, void 0, void 0, function* () {
        let catchResolved = false;
        try {
            yield tryCatch_1.tryCatch(Promise.reject(), tryCatch_1.Catch(Error, (e) => __awaiter(void 0, void 0, void 0, function* () {
                yield new Promise(res => setTimeout(res, 1));
                catchResolved = true;
                throw e;
            })));
            fail();
        }
        catch (e) { }
        expect(catchResolved).toBeTruthy();
    }));
    it('should not call into further catchers if catcher throws', () => {
        const eCatch = jest.fn();
        const e2Catch = jest.fn(() => { throw new Error; });
        class E2 extends Error {
        }
        try {
            tryCatch_1.tryCatch(() => { throw new E2; }, tryCatch_1.Catch(E2, e2Catch), tryCatch_1.Catch(Error, eCatch));
            fail();
        }
        catch (e) { }
        expect(e2Catch).toHaveBeenCalled();
        expect(eCatch).not.toHaveBeenCalled();
    });
    it('should compile with the proper error', () => {
        class E2 extends Error {
            constructor() {
                super(...arguments);
                this.prop = 'test';
            }
        }
        tryCatch_1.tryCatch(() => { }, tryCatch_1.Catch(E2, e => e.prop));
    });
    it('should call first catcher that matches, not most precise', () => {
        class E2 extends Error {
        }
        ;
        const eCatcher = jest.fn();
        const e2Catcher = jest.fn();
        tryCatch_1.tryCatch(() => { throw new E2; }, tryCatch_1.Catch(Error, eCatcher), tryCatch_1.Catch(E2, e2Catcher));
        expect(eCatcher).toHaveBeenCalled();
        expect(e2Catcher).not.toHaveBeenCalled();
    });
    it('should not call into further catchers if catcher throws for promise', () => __awaiter(void 0, void 0, void 0, function* () {
        const eCatch = jest.fn();
        const e2Catch = jest.fn(() => { throw new Error; });
        class E2 extends Error {
        }
        try {
            yield tryCatch_1.tryCatch((() => __awaiter(void 0, void 0, void 0, function* () { throw new E2; }))(), tryCatch_1.Catch(E2, e2Catch), tryCatch_1.Catch(Error, eCatch));
            fail();
        }
        catch (e) { }
        expect(e2Catch).toHaveBeenCalled();
        expect(eCatch).not.toHaveBeenCalled();
    }));
    it('should treat async function like promise and resolve it', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield tryCatch_1.tryCatch(() => __awaiter(void 0, void 0, void 0, function* () { return 1; }))).toBe(1);
    }));
    it('should await catcher when using async function', () => __awaiter(void 0, void 0, void 0, function* () {
        let catcherAwaited = false;
        try {
            yield tryCatch_1.tryCatch(() => __awaiter(void 0, void 0, void 0, function* () { throw new Error; }), tryCatch_1.Catch(Error, () => __awaiter(void 0, void 0, void 0, function* () {
                yield new Promise(res => setTimeout(res, 10));
                catcherAwaited = true;
                throw new Error;
            })));
        }
        catch (e) { }
        expect(catcherAwaited).toBe(true);
    }));
    it('should hit custom Error catcher but not other when passed in opposite order', () => {
        class CustError extends Error {
        }
        const catchHandler = jest.fn(() => { });
        const custCatchHandler = jest.fn(() => { });
        tryCatch_1.tryCatch(() => { throw new CustError; }, tryCatch_1.Catch(CustError, custCatchHandler), tryCatch_1.Catch(Error, catchHandler));
        expect(catchHandler).not.toHaveBeenCalled();
        expect(custCatchHandler).toHaveBeenCalled();
    });
    it('should hit Error catcher for extended Errors', () => {
        class ExtendedError extends Error {
        }
        const catcher = jest.fn(() => { });
        const err = Error;
        console.log('\n\n\n\ntesting', new ExtendedError instanceof err);
        tryCatch_1.tryCatch(() => { throw new ExtendedError; }, tryCatch_1.Catch(Error, catcher));
        expect(catcher).toHaveBeenCalled();
    });
    it('should not hit custom Error catcher if base is registered first', () => {
        class CustError extends Error {
        }
        const catchHandler = jest.fn(() => { });
        const custCatchHandler = jest.fn(() => { });
        tryCatch_1.tryCatch(() => { throw new CustError; }, tryCatch_1.Catch(Error, catchHandler), tryCatch_1.Catch(CustError, custCatchHandler));
        expect(catchHandler).toHaveBeenCalled();
        expect(custCatchHandler).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=tryCatch.spec.js.map
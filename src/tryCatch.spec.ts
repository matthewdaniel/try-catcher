import { Catch, Finally, tryCatch } from './tryCatch';

describe('try catcher', () => {
    it('should not call catch if no error thrown', () => {
        const catchHandler = jest.fn((e) => {}) as any;

        tryCatch(
            () => {},
            Catch(Error, catchHandler)
        );

        expect(catchHandler).not.toHaveBeenCalled();
    });

    it('should call finally if provided and no error thrown', () => {
        const finallyHandler = jest.fn(() => {});

        tryCatch(
            () => {},
            Finally(finallyHandler)
        );

        expect(finallyHandler).toHaveBeenCalled();
    });

    it('should call finally when we throw', () => {
        const finallyHandler = jest.fn(() => {});

        try {
            tryCatch(
                () => { throw new Error; },
                Finally(finallyHandler)
            );
            fail();
        } catch (e) {
            expect(finallyHandler).toHaveBeenCalled();
        }
    });

    it('should call catch when we throw general error and swallow error', () => {
        const catcher = jest.fn(() => {});
        tryCatch(
            () => { throw new Error; },
            Catch(Error, catcher)
        );

        expect(catcher).toHaveBeenCalled();
    });

    it('should throw if catcher throws', () => {
        const catcher = jest.fn(() => {
            throw new Error;
        });

        try {
            tryCatch(
                () => { throw new Error; },
                Catch(Error, catcher)
            );
            fail();
        } catch (e) {
            expect(catcher).toHaveBeenCalled();
        }
    });

    it('should throw if finally throws', () => {
        const finallyHandler = jest.fn(() => { throw Error('test'); });

        try {
            tryCatch(
                () => { },
                Finally(finallyHandler)
            );
            fail();
        } catch (e) {
            expect(finallyHandler).toHaveBeenCalled();
        }
    });

    it('should hit finally when a Catcher throws', () => {
        const finallyHandler = jest.fn(() => {});
        try {
            tryCatch(
                () => { throw new Error; },
                Catch(Error, (e) => { throw new Error; }),
                Finally(finallyHandler),
            );
            fail();
        } catch (e) {
            expect(finallyHandler).toHaveBeenCalled();
        }
    });

    it('should return result of trier', () => {
        expect(tryCatch(() => 'test')).toBe('test');
    });

    it('should not return the result of finally when no error thrown', () => {
        const res = tryCatch(() => 'test', Finally(() => 'test1'));
        expect(res).toBe('test');
    });

    it('should return result of catcher', () => {
        const res = tryCatch(() => { throw new Error; }, Catch(Error, () => 'test'));
        expect(res).toBe('test');
    });

    it('should resolve promise', async () => {
        const result = await tryCatch(Promise.resolve('test'));

        expect(result).toBe('test');
    });

    it('should return result of catch promise on throw', async () => {
        const result = await tryCatch(
            new Promise(res => { throw new Error; }),
            Catch(Error, e => Promise.resolve('test')),
        );

        expect(result).toBe('test');
    });

    it('should wrap rejects inside error', async () => {
        const result = await tryCatch(
            Promise.reject(),
            Catch(Error, e => Promise.resolve('test')),
        );

        expect(result).toBe('test');
    });

    it('should support async function', async () => {
        const res = await tryCatch((async () => {
            const first = await Promise.resolve(1);
            const second = await Promise.resolve(2);
            return Promise.resolve(3);
        })());

        expect(res).toBe(3);
    });

    it('it should await finally', async () => {
        let finallyResolved = false;
        try {
            await tryCatch(
                Promise.reject(),
                Finally(async () => {
                    await new Promise(res => setTimeout(res, 1));
                    finallyResolved = true;
                })
            );
            fail();
        } catch (e) {}

        expect(finallyResolved).toBeTruthy();
    });

    it('should await catcher when catcher throws', async () => {
        let catchResolved = false;
        try {
            await tryCatch(
                Promise.reject(),
                Catch(Error, async (e) => {
                    await new Promise(res => setTimeout(res, 1));
                    catchResolved = true;
                    throw e;
                })
            );
            fail();
        } catch (e) {}

        expect(catchResolved).toBeTruthy();
    });

    it('should not call into further catchers if catcher throws', () => {
        const eCatch = jest.fn();
        const e2Catch = jest.fn(() => { throw new Error; });
        class E2 extends Error {}

        try {
            tryCatch(
                () => { throw new E2; },
                Catch(E2, e2Catch),
                Catch(Error, eCatch),
            );
            fail();
        } catch (e) {}

        expect(e2Catch).toHaveBeenCalled();
        expect(eCatch).not.toHaveBeenCalled();
    });

    it('should compile with the proper error', () => {
        class E2 extends Error {
            prop = 'test'
        }
        tryCatch(() => {}, Catch(E2, e => e.prop));
    });

    it('should call first catcher that matches, not most precise', () => {
        class E2 extends Error {};

        const eCatcher = jest.fn();
        const e2Catcher = jest.fn();

        tryCatch(
            () => { throw new E2 },
            Catch(Error, eCatcher),
            Catch(E2, e2Catcher),
        );

        expect(eCatcher).toHaveBeenCalled();
        expect(e2Catcher).not.toHaveBeenCalled();
    });

    it('should not call into further catchers if catcher throws for promise', async () => {
        const eCatch = jest.fn();
        const e2Catch = jest.fn(() => { throw new Error; });
        class E2 extends Error {}

        try {
            await tryCatch(
                (async () => { throw new E2; })(),
                Catch(E2, e2Catch),
                Catch(Error, eCatch),
            );
            fail();
        } catch (e) {}

        expect(e2Catch).toHaveBeenCalled();
        expect(eCatch).not.toHaveBeenCalled();
    });

    it('should treat async function like promise and resolve it', async () => {
        expect(await tryCatch(async () => 1)).toBe(1);
    });

    it('should await catcher when using async function', async () => {
        let catcherAwaited = false;
        try {
            await tryCatch(async () => { throw new Error; }, Catch(Error, async () => {
                await new Promise(res => setTimeout(res, 10));
                catcherAwaited = true;
                throw new Error;
            }));
        } catch (e) {}

        expect(catcherAwaited).toBe(true);
    });

    it('should hit custom Error catcher but not other when passed in opposite order', () => {
        class CustError extends Error {}

        const catchHandler = jest.fn(() => {}) as any;
        const custCatchHandler = jest.fn(() => {}) as any;

        tryCatch(
            () => { throw new CustError; },
            Catch(CustError, custCatchHandler),
            Catch(Error, catchHandler),
        );

        expect(catchHandler).not.toHaveBeenCalled();
        expect(custCatchHandler).toHaveBeenCalled();
    });

    it('should hit Error catcher for extended Errors', () => {
        class ExtendedError extends Error {}
        const catcher = jest.fn(() => {});

        const err = Error;
        console.log('\n\n\n\ntesting', new ExtendedError instanceof err)
        tryCatch(
            () => { throw new ExtendedError; },
            Catch(Error, catcher),
        );

        expect(catcher).toHaveBeenCalled();
    });

    it('should not hit custom Error catcher if base is registered first', () => {
        class CustError extends Error {}

        const catchHandler = jest.fn(() => {}) as any;
        const custCatchHandler = jest.fn(() => {}) as any;

        tryCatch(
            () => { throw new CustError; },
            Catch(Error, catchHandler),
            Catch(CustError, custCatchHandler),
        );

        expect(catchHandler).toHaveBeenCalled();
        expect(custCatchHandler).not.toHaveBeenCalled();
    });
});

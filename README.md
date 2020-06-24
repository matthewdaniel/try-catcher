# try-catcher
> Support class based catchers similar to java / c#.
# install
> npm install -s try-catcher
# Usage
```js
import { tryCatch, tryCatcher, Catch, Finally } from 'try-catcher';

class MyCustomError extends Error {}

// non async example
tryCatch(
    () => { throw new MyCustomError; },
    Catch(MyCustomError, e => { /* do something */ }),
    Catch(Error, e => { /* do something else */ }),
    Finally(() => { /* close db connection maybe? */ })
);

// promise example
const color = await tryCatch(
    http.get('/get/default/color'),
    Catch(Error404, () => { return 'red' }),
    Catch(Error500, () => { return 'black' }),
    Catch(Error, (e) => {
        log(error);
        throw e;
    })
);

// async example
await tryCatch(
    async () => { /* work */ },
    Catch(Error, async (e) => { /* more work */ }),
    Finally(async () => { /* more async work */ }),
)
```

    The try catch will return the result of the function if no error else a catch return else will just throw the error if none exist.

    If a promise or async function is used then tryCatch will be awaitable. All async functions will be awaited before try catch returns results.

    Finnaly will be run even if no catcher caught the error. In that case after finally runs then the initially error would be thrown and your next line after tryCatch would not be hit (assuming you await or have a synchronous trier)
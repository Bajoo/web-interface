import assert from "assert";
import AsyncProp from "../../src/utils/async_prop";


/** @test {AsyncProp} */
describe('AsyncProp', () => {

    it('can be instanced', () => {
        let prop = new AsyncProp();
    });

    it('is not set at instantiation', () => {
        let prop = new AsyncProp();
        assert.deepEqual(prop(), undefined);
    });

    it('has no error at instantiation', () => {
        let prop = new AsyncProp();
        assert.deepEqual(prop.error, null);
    });

    // 1. can be called to set the result
    // can be called to GET the result.

    it('can get and set values by function call', () => {
        let prop = new AsyncProp();
        prop(33);
        assert.equal(prop(), 33);
        let value = {};
        prop(value);
        assert.deepEqual(prop(), value);
    });

    it('removes any error when a new value is set', () => {
        let prop = new AsyncProp();
        prop.error = new Error('!!');
        prop('new value');
        assert.deepEqual(prop.error, null);
    });

    it('keep the error when the value is read', () => {
        let prop = new AsyncProp();
        let err = new Error('!!');
        prop.error = err;
        prop();
        assert.deepEqual(prop.error, err);
    });

    /** @test {AsyncProp#set_error} */
    describe('#set_error()', () => {

        /** @test {AsyncProp#set_error} */
        it('remove the error attribute', () =>  {
            let prop = new AsyncProp();
            let err = new Error('!!');
            prop.set_error(err);
            assert.deepEqual(prop.error, err);
        });

        /** @test {AsyncProp#set_error} */
        it('remove the stored value', () =>  {
            let prop = new AsyncProp();
            prop.value = 'exists';
            prop.set_error(new Error('!!'));
            assert.deepEqual(prop.value, undefined);
        });
    });

    /** @test {AsyncProp#load} */
    describe('#load()', () => {

        /** @test {AsyncProp#load} */
        it('should call the loader', () => {
            let prop = new AsyncProp();
            let success = false;
            let loader = () => {
                success = true;
                return Promise.resolve();
            };

            return prop.load(loader).then(() => {
                assert.deepEqual(success, true);
            });
        });

        /** @test {AsyncProp#load} */
        it('should return a promise wrapping the AsyncProp instance', () => {
            let prop = new AsyncProp();

            return prop.load(() => Promise.resolve(true)).then(that => {
                assert.deepEqual(that, prop);
            });
        });

        /** @test {AsyncProp#load} */
        it('should set the value when the loader promise is fulfilled', () => {
            let prop = new AsyncProp();
            let loader = () => Promise.resolve(753);

            return prop.load(loader).then(() => {
                assert.deepEqual(prop.value, 753);
            });
        });

        /** @test {AsyncProp#load} */
        it('should return a promise always fulfilled', () => {
            let prop = new AsyncProp();
            let loader = () => Promise.reject(new Error('Example error'));

            return prop.load(loader);
        });

        /** @test {AsyncProp#load} */
        it('should set the error when the loader promise is rejected', () => {
            let prop = new AsyncProp();
            let error = new Error('Example error');
            let loader = () => Promise.reject(error);

            return prop.load(loader).then(() => {
                assert.deepEqual(prop.error, error);
            });

        });

        /** @test {AsyncProp#load} */
        it('should call the "onerror" callback when the promise is rejected', () => {
            let prop = new AsyncProp();
            let loader = () => Promise.reject(new Error('Example error'));

            let success = false;
            prop.onerror = () => success = true;

            return prop.load(loader).then(() => {
                assert.deepEqual(success, true);
            });
        });

        /** @test {AsyncProp#load} */
        it('should reuse the same promise when called twice or more at the same time', () => {
            let prop = new AsyncProp();
            let loader_call = 0;
            let resolve_loader  = null;

            function loader() {
                loader_call++;
                return new Promise(resolve => resolve_loader = resolve);
            }

            let promise = prop.load(loader); // loader call ++
            let p2 = prop.load(loader);
            assert.deepEqual(promise, p2, 'X');
            assert.deepEqual(promise, prop.load(loader)); // loader not called

            promise.then(() => {
                assert.notEqual(promise, prop.load(loader)); // loader call ++
                assert.deepEqual(loader_call, 2);
            });
            resolve_loader();
        });
    });

    /** @test {AsyncProp#dispatch} */
    describe('#dispatch()', () => {

        /** @test {AsyncProp#dispatch} */
        function fail_test_cb() {
            throw new Error('This callback should not be called');
        }

        /** @test {AsyncProp#dispatch} */
        it('should call the "loaded" callback if loaded', () => {
            let prop = new AsyncProp();
            prop.value = 999;

            let res = prop.dispatch(value => {
                assert.deepEqual(value, 999);
                return 1000;
            }, fail_test_cb, fail_test_cb);
            assert.deepEqual(res, 1000);
        });

        /** @test {AsyncProp#dispatch} */
        it('should call the "loading" callback if not loaded', () => {
            let prop = new AsyncProp();

            let res = prop.dispatch(fail_test_cb, () => 'loading value', fail_test_cb);
            assert.deepEqual(res, 'loading value');
        });

        /** @test {AsyncProp#dispatch} */
        it('should call the "failed" callback if in error', () => {
            let prop = new AsyncProp();
            prop.error = new Error('Example error');

            let res = prop.dispatch(fail_test_cb, fail_test_cb, err => {
                assert.deepEqual(err, prop.error);
                return 'FAILBACK';
            });
            assert.deepEqual(res, 'FAILBACK');
        });

        /** @test {AsyncProp#dispatch} */
        it('should accept undefined arguments', () => {
            let prop = new AsyncProp();

            prop.value = 'Is loaded';
            assert.equal(prop.dispatch(() => 'OK'), 'OK');
        });

        /** @test {AsyncProp#dispatch} */
        it('should return null if there is not callback', () => {
            let prop = new AsyncProp();
            assert.deepEqual(prop.dispatch(), null);

            let loaded_prop = new AsyncProp();
            loaded_prop.value = 'Defined';
            assert.deepEqual(loaded_prop.dispatch(), null);
        });

        /** @test {AsyncProp#dispatch} */
        it('should return null if the callback argument is set to null', () => {
            let prop = new AsyncProp();

            let res = prop.dispatch(fail_test_cb, null, fail_test_cb);
            assert.deepEqual(res, null);

            let loaded_prop = new AsyncProp();
            loaded_prop.value = 'Defined';
            res = loaded_prop.dispatch(null, fail_test_cb, fail_test_cb);
            assert.deepEqual(res, null);
        });
    });
});


import assert from 'assert';
import {log_failed_promise, safe_exec_callback} from '../../src/utils/callbacks';


describe('Module callback:', () => {

    /** @test {log_failed_promise} */
    describe('log_failed_promise()', () => {

        /** @test {log_failed_promise} */
        it('should return a method throwing error passed as argument', () => {
            let error_logger = console.error;
            console.error = () => null;

            try {
                let f = log_failed_promise('msg');
                let err = new Error();
                assert.throws(() => f(err), thrown_err => thrown_err === err);
            } finally {
                console.error = error_logger;
            }
        });

        /** @test {log_failed_promise} */
        it('should display the message and the error in the console', () => {
            let err = new Error();

            let error_logger = console.error;
            console.error = (...args) => {
                assert.equal(args.length, 2);
                assert.deepEqual(args[0], 'Message');
                assert.deepEqual(args[1], err);
            };
            try {
                log_failed_promise('Message')(err);
            } catch (error) { // error expected
            } finally {
                console.error = error_logger;
            }
        });
    });

    /** @test {safe_exec_callback} */
    describe('#safe_exec_callback()', function() {

        /** @test {safe_exec_callback} */
        it('execute the callback', () => {
            let success = false;
            safe_exec_callback(() => success = true, 'test');
            assert.deepEqual(success, true);
        });

        /** @test {safe_exec_callback} */
        it('pass all extra arguments to the callback', () => {
            let success = false;
            let cb = (a, b, c) => {
                assert.deepEqual(a, 1);
                assert.deepEqual(b, 2);
                assert.deepEqual(c, 3);
                // Obviously, assertion failed here are caught by safe_exe_callback()
                // We use 'success' to ensure the function is executed until the end.
                success = true;
            };
            safe_exec_callback(cb, 'test', 1, 2, 3);
            assert.deepEqual(success, true);
        });

        /** @test {safe_exec_callback} */
        it('catch errors thrown by the callback', () => {
            let error_logger = console.error;
            console.error = () => null;

            try {
                let cb = () => {
                    throw new Error();
                };
                safe_exec_callback(cb, 'test');
            } finally {
                console.error = error_logger;
            }
        });

        /** @test {safe_exec_callback} */
        it('display an error message if a callback throw an exception', () => {
            let error_logger = console.error;
            let console_called = false;
            console.error = () => console_called = true;

            try {
                let cb = () => {
                    throw new Error();
                };
                safe_exec_callback(cb, 'test');
            } finally {
                console.error = error_logger;
            }
            assert.deepEqual(console_called, true);
        });

        /** @test {safe_exec_callback} */
        it('ignores null callbacks', () => {
            let error_logger = console.error;
            console.error = () => {
                throw new Error('Should not happen');
            };

            try {
                safe_exec_callback(null, 'test'); // do nothing
            } finally {
                console.error = error_logger;
            }
        });
    });
});

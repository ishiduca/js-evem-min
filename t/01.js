(function (global) {
    'use strict'

    var isBrowser = !! global.self
    var isWorker  = !! global.WorkerLocation
    var isNodeJS  = !! global.global

    var path
    if (isNodeJS) {
        path = require('path')
        subtest(
            require(path.join( __dirname, './qunit/driver')).QUnit
          , require(path.join( __dirname, '../evem-min'))
        )
    }
    else {
        subtest(global.QUnit, global.emitter)
    }

    function subtest (QUnit, emitter) {
        function instance () {
            var F = function () { this.constructor.call(this) }
            F.prototype = emitter
            return new F
        }

        QUnit.module('.constructor')
        test('var em = Object.create(emitter).constructor()', function () {
            var em = Object.create(emitter).constructor()
            ok(em, 'exists em')
            ok(em.emit, 'exists em.emit')
            ok(em.constructor, 'exists em.constructor')
            deepEqual(em.evs, {}, 'em.evs deepEqual "{}"')
        })

        test('var em = instanceFunction(emitter)', function () {
            var em = instance()
            ok(em, 'exists em')
            ok(em.emit, 'exists em.emit')
            ok(em.constructor, 'exists em.constructor')
            deepEqual(em.evs, {}, 'em.evs deepEqual "{}"')
        })

        QUnit.module('.emit')
        test('true = em.emit("register_event")', function () {
            var em = instance()
            em.on('ev', function () {})
            is(em.emit('ev'), true, 'en.emit("ev") -> true')
        })
        test('false = em.emit("no_register_event")', function () {
            var em = instance()
            is(em.emit('ev'), false, 'en.emit("ev") -> false')
        })
        test('emitした回数リスナーが呼ばれているか', function () {
            var em = instance()
            var c = 0
            em.on('ev', function () { c++ })

            em.emit('ev')
            em.emit('ev')
            em.emit('ev')

            is(c, 3, "em.emit('ev'); em.emit('ev'); em.emit('ev') -> c === 3")
        })
        test('emitした複数の引数がリスナーに渡されているか', function () {
            var em = instance()
            var a = 3, b = 2, c = 1
            em.on('ev', function (x, y, z) {
                is(a, x)
                is(b, y)
                is(c, z)
            })

            em.emit('ev', a, b, c)
        })

        QUnit.module('.removeListener')
        test('aliase .removeListener .off', function () {
            var em = instance()
            is(em.removeListener, em.off)
        })
        test('em.off は em自身を返す', function () {
            var em = instance()
            is(em.off('ev', function () {}), em)
        })
        test('em.off(listener)したリスナーは存在する', function () {
            var em = instance()
            var c  = 0
            var dummy = function () {
                c++
                em.off('ev', dummy)
            }
            em.on('ev', dummy)
            em.emit('ev')
            em.emit('ev')

            is(c, 1)
            is(typeof dummy, 'function')
        })
        test('offした後には、イベントリスナーを実行しないか', function () {
            var em  = instance()
            var c   = 0
            var inc = function () { c += 1 }
            em.on('ev', inc)
            em.emit('ev')

            em.off('ev', inc)
            em.emit('ev')

            is(c, 1)
        })

        QUnit.module('.on')
        test('aliase .addListener .on', function () {
            var em = instance()
            is(em.addListener, em.on)
        })
        test('em.on は em自身を返す', function () {
            var em = instance()
            is(em.on('ev', function () {}), em)
        })
        test('任意のイベントに登録した複数のリスナーが順番に処理を行うか', function () {
            var em = instance()
            var res = []
            var c = 0

            for (var i = 0; i < 3; i++) {
                em.on('ev', (function (i) {
                    return function (x, y, z) {
                        res.push({
                            args: [ x, y, z]
                          , arglen: arguments.length
                          , count: i
                        })
                    }
                })(i))
            }

            em.emit('ev', -1, 0, 1)

            deepEqual(res, [
                {args: [ -1, 0, 1 ], arglen: 3, count: 0}
              , {args: [ -1, 0, 1 ], arglen: 3, count: 1}
              , {args: [ -1, 0, 1 ], arglen: 3, count: 2}
            ], JSON.stringify(res))
        })
        test('不特定数のデータがemitされた時に受け取ることが出来るか', function () {
            var em = instance()
            var res = []
            function sum () {
                var s = 0
                for (var i = 0, len = arguments.length; i < len; i++) {
                    s += arguments[i]
                }
                res.push(s)
            }

            em.on('ev', sum)

            em.emit('ev', 1)
            em.emit('ev', 1, 2)
            em.emit('ev', 1, 2, 3)

            deepEqual(res, [ 1, 3, 6 ])
        })

        QUnit.module('.once')
        test('em.once は em自身を返す', function () {
            var em = instance()
            is(em.once('ev', function () {}), em)
        })
        test('em.once(listener)されたリスナーは一度しか実行できない', function () {
            var em = instance()
            var res = []
            var listeners = []
            for (var i = 0; i < 3; i++) {
                listeners[i] = (function (i) {
                    return function (a, b, c) {
                        res.push({
                            args: [a, b, c]
                          , count: i
                        })
                    }
                })(i)
            }

            em.once('ev', listeners[0])
            em.on(  'ev', listeners[1])
            em.once('ev', listeners[2])

            em.emit('ev', 1, 2, 3)
            em.emit('ev', -1, -2, -3)

            deepEqual(res, [
                {args: [ 1, 2, 3 ], count: 0}
              , {args: [ 1, 2, 3 ], count: 1}
              , {args: [ 1, 2, 3 ], count: 2}
              , {args: [ -1, -2, -3 ], count: 1}
            ], JSON.stringify(res))
        })
    }
})(this.self || global)

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
        var like = QUnit.deepEqual

        function subt (timer, Timer) {
            ok(timer, 'exists timer')

            like(timer.evs, {}, 'exists timer.evs')
            ok(timer.hasOwnProperty('evs'), 'timer.hasOwnProperty("evs")')

            is(timer.limit, 10, 'timer.limit == 10')


            is(timer.constructor, Timer, 'timer.constructor === Timer')    
        }

        QUnit.module('inherits use "new" or "Object.create"')
        test('use "new"', function () {
            var Timer = function (limit) {
                emitter.constructor.call(this)
                this.limit = limit
            }
            Timer.prototype = function () {
                var F = function () {}
                F.prototype = emitter
                return new F
            }()
            Timer.prototype.constructor = Timer

            var timer
            subt((timer = new Timer(10)), Timer)
            ok(timer instanceof Timer, 'timer instanceof Timer')
        })

        test('use "Object.create"', function () {
            var timer = Object.create(emitter, {
                constructor: {
                    value: function (limit) {
                        this.limit = limit
                        emitter.constructor.call(this)
						return this
                    }
                }
            })

            subt(timer.constructor(10), timer.constructor)
        })
    }
})(this.self || global)

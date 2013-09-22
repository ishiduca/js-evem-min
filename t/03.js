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

        var timer_proto_ = Object.create(emitter, {
            start: {
                value: function () {
                    var that = this
                    this.id = setInterval(function () {
                        that.limit > 0
                            ? that.emit('count', that.limit--)
                            : that.stop()
                    }, 1000)
                }
            }
          , stop: {
                value: function () {
                    clearInterval(this.id)
                    this.id = null
                    if (this.limit <= 0) this.emit('end')
                }
            }
          , constructor: {
                value: function (limit) {
                    this.limit = limit
                    emitter.constructor.call(this)
                    return this
                }
            }
        })

        QUnit.module('inherits')
        test('emitter をプロトタイプに持つ timer_proto_', function () {
            ok(timer_proto_, 'exists timer_proto_')

            ok('on' in timer_proto_, 'exists timer_proto_.on')
            is(timer_proto_.on, emitter.on, 'timer_proto_.on === emitter.on')

            ok(!('evs' in timer_proto_), 'not exists timer_proto_.evs')

            ok('stop' in timer_proto_, 'exists timer_proto_.stop')
            ok(!('stop' in emitter), 'not exists emitter.stop')

            ok('constructor' in timer_proto_, 'exists timer_proto_.constructor')
            notStrictEqual(timer_proto_.constructor, emitter.constructor
              , 'timer_proto_.constructor !== emitter.constructor')
        })
        test('timer_proto_をプロトタイプに持つ timer', function () {
            var timer = Object.create(timer_proto_).constructor(10)
            ok(timer, 'exists timer')

            is(timer.constructor, timer_proto_.constructor
              , 'timer.constructor === timer_proto_.constructor')

            is(timer.on, emitter.on, 'timer.on === emitter.on')
            is(timer.on, timer_proto_.on, 'timer.on === timer_proto_.on')

            ok('evs' in timer, 'exists timer.evs')
            ok('limit' in timer, 'exists timer.limit')
            is(timer.limit, 10, 'timer.limit === 10')

            ok('stop' in timer, 'exists timer.stop')
            is(timer.stop, timer_proto_.stop, 'timer.stop === timer_proto_.stop')
            timer.on('end', function () {
                ok('timer emit "end"', 'can "emit" && "on"')
            })
            timer.emit('end')
        })
        test('timer1 と timer2 は別のインスタンスであるか', function () {
            var timers = []
            timers[0]  = Object.create(timer_proto_).constructor(5)
            timers[1]  = Object.create(timer_proto_).constructor(3)
            is(timers[0].limit, 5, 'timers[0].limit === 5')
            is(timers[1].limit, 3, 'timers[1].limit === 3')
        })
    }
})(this.self || global)

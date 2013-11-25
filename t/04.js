(function (global) {
    'use strict'

    var isBrowser = !! global.self
    var isWorker  = !! global.WorkerLocation
    var isNodeJS  = !! global.global

    var q, emitter
    if (isNodeJS) {
        q = require('qunitjs')
        require('qunit-tap')(q, function () { console.log.apply(console, arguments) })
        emitter = require(dir('../evem-min'))
    } else {
        q = QUnit
        emitter = global.emitter
    }

    if (isNodeJS) {
        q.init()
        q.config.updatRate = 0
    }

    q.assert.is = q.assert.strictEqual
    q.assert.like = function (str, reg, mes) { this.ok(reg.test(str), mes) }

    suites(q, emitter)
})(this.self || global)

function suites (q, emitter) {
    q.module('emitter.mixin')
    q.test('emitter has a ".mixin"', function (t) {
        t.ok(emitter)
        t.ok(emitter.mixin)
    })
    q.test('object have methods of emitter', function (t) {
        var o = {a: -1}
        emitter.mixin(o)

        t.ok(o.on)
        t.ok(o.off)
        t.ok(o.emit)
        t.ok(o.once)

        t.ok(o.evs)
    })
    q.test('emitter.mixin(object)', function (t) {
        var o = {
            _: 0
          , inc: function () { this._ += 1; return this  }
          , get: function () {return this._}
        }

        var inc = o.inc

        emitter.mixin(o)

        o.inc = function () {
            inc.apply(this)
            this.emit('inc', this.get())
            return this
        }

        o.on('inc', function (n) {
            t.is(n, 1)
        })

        o.inc()
    })

    q.module('emitter.inherits')
    q.test('emitter has a ".inherits"', function (t) {
        t.ok(emitter.inherits)
    })
    q.test('instace have methods of emitter', function (t) {
        var Greet = function () {
            emitter.constructor.call(this)
            this.word = 'hello'
            return this
        }
        emitter.inherits(Greet)

        var g = new Greet

        t.ok(g)
        t.is(g.word, 'hello')
        t.ok(g.on)
        t.ok(g.off)
        t.ok(g.emit)
        t.ok(g.once)

        t.ok(g.evs)
    })
    q.test('', function (t) {
        var Greet = function () {
            emitter.constructor.call(this)
            this.word = 'hello'
            return this
        }
        emitter.inherits(Greet)
        Greet.prototype.hello = function () {
            return this.word
        }

        var g = new Greet

        g.on('hello', function (word) {
            t.is(word, 'hello')
        })

        g.emit('hello', g.hello())
    })
}

function dir (p) { return require('path').join( __dirname, p) }

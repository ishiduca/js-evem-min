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
        QUnit.module('モジュールの読み込み')
        test('emitter', function () {
            ok(emitter, 'exists emitter')
            ok(emitter.emit, 'exists emitter.emit')
            ok(emitter.constructor, 'exists emitter.constructor')
        })
    }
})(this.self || global)

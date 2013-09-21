(function (global) {
    'use strict'

    var isBrowser = !! global.self
    var isWorker  = !! global.WorkerLocation
    var isNodeJS  = !! global.global

    var emitter = {}
    emitter.constructor = function constructor () {
        this.evs = {}
        return this
    }
    emitter.on = emitter.addListener = function (name, listener) {
        ;(this.evs[name] || (this.evs[name] = [])).push(listener)
        return this
    }
    emitter.once = function (name, listener) {
        var me = this
        function _remove () {
            listener.apply(null, arguments)
            me.off(name, _remove)
        }
        return this.on(name, _remove)
    }
    emitter.emit = function () {
        var args = [].slice.apply(arguments)
        var name = args.shift()
        var evs  = this.evs[name] || []
        var flg  = false
        for (var i = 0, l = evs.length; i < l; i++) {
            typeof evs[i] === 'function' && (flg = true) && evs[i].apply(null, args)
        }
        return flg
    }
    emitter.off = emitter.removeListener = function (name, listener) {
        this.evs[name] && (this.evs[name][ this.evs[name].indexOf(listener) ] = null)
        return this
    }


    if (isNodeJS) {
        module.exports = emitter
    } else {
        global.emitter = emitter
    }

})(this.self || global)

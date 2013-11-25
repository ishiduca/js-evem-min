;(function (global) {
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
        //this.evs[name] && (this.evs[name][ this.evs[name].indexOf(listener) ] = null)
        this.evs[name] && (this.evs[name][ indexOf(this.evs[name], listener) ] = null)
        return this
    }
    emitter.mixin = function (o) {
        var m = ['on', 'addListener', 'off', 'removeListener', 'once', 'emit']
        for (var i = 0, len = m.length; i < len; i++) {
            o[m[i]] = this[m[i]]
        }
        this.constructor.call(o)
    }
    emitter.inherits = function (Cnstrctr) {
        var F = function () {}
        F.prototype = this
        Cnstrctr.prototype = new F
        Cnstrctr.prototype.constructor = Cnstrctr
    }


    if (isNodeJS) {
        module.exports = emitter
        module.exports.constructor.prototype = module.exports
    } else {
        global.emitter = emitter
        global.emitter.constructor.prototype = emitter
    }

})(this.self || global)

function indexOf (arry, search) {
    if (typeof arry.indexOf === 'function') {
        return arry.indexOf(search)
    }

    for (var i = 0, len = arry.length; i < len; i++) {
        if (arry[i] === search) return i
    }
    return -1
}

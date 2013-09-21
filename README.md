# evem-min

Tiny event emitter of Browser

## synopsis

````js
<script src="path/to/evem-min.js"></script>
var timer = Object.create(emitter, {
    constructor: {
        value: function (limit) {
            this.limit = limit
            emitter.constructor.call(this)
            return this
        }
      , enumerable: false
      , writable: true
      , configurable: true
    }
}).constructor(10)

// case Object.create === undefined
// function Timer (limit) {
//     emitter.constructor.call(this)
//     this.limit = limit
// }
// Timer.prototype = (function () {
//     var F = function () {}
//     F.prototype = emitter
//     return new F
// })()
// Timer.prototype.constructor = Timer
//
// var timer = new Timer(10)

timer.on('foo', function () { console.log(timer.limit) })

timer.emit('foo') // 10
````


### method

- on (= addListener)
- off (= removeListener)
- emit
- once

const Rx = require('rx')
const redis = require('redis')
const AsyncLock = require('async-lock')

const client1 = redis.createClient({ port: 32768 })
const client2 = redis.createClient({ port: 32768 })

const lock = new AsyncLock()

const interval = Rx.Observable.interval
const timer = Rx.Observable.timer
const key = 'score'

const print = (taskId, tag) => {
  return (err, value) => {
    if (err) return
    console.log(`[${taskId}] [tag = ${tag}] key = ${value}`)
  }
}

const createTaskID = function () {
  return Math.random() * 100000000000000000
}


function increment (client, taskId, tag) {
  lock.acquire('lock', function (done) {
    client.get(key, (err, value) => {
      if (err || value > 3) {
        done()
        return
      }

      client.incr(key, function (err, value) {
        print(taskId, tag)(err, value)
        done()
      })
    })
  })
}

timer(100).subscribe(() => {
  // init key => 0
  client1.set(key, 0, redis.print)
})

timer(1000).subscribe(() => {
  interval(0).subscribe(x => {
    const taskId = createTaskID()
    increment(client1, taskId, 1)
    increment(client2, taskId, 2)
  })
})


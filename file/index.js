const Rx = require('rx')
const locker = require('./lock')
const fs = require('fs')
const path = require('path')

const interval = Rx.Observable.interval
const filePath = path.join(__dirname, './content.txt')

const writeFile = (str) => {
  locker.lock(function (err) {
    if (err) {
      console.log('throw away ' + str)
      return
    }

    let content = ''
    
    try {
      content = fs.readFileSync(filePath);
    } catch (err) {
    }

    fs.writeFile(filePath, content + '\n' + str, (err) => {
      console.log('write ' + str)
      locker.unlock(function () {})
    })
  })
}

interval(0).subscribe((i) => {
  writeFile(i)
})

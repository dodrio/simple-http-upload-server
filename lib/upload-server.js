'use strict'

const fs = require('fs')
const path = require('path')
const promisify = require('es6-promisify')
const Koa = require('koa')
const koaBody = require('koa-body')

const rename = promisify(fs.rename)

async function fixFilename (file) {
  console.log(file)
  const src = file.path
  const dest = path.join(
    path.dirname(src),
    file.name
  )
  console.log(src, dest)
  await rename(src, dest)
}

function uploadServer (uploadDir) {
  const app = new Koa()

  const bodyparser = koaBody({
    multipart: true,
    multiples: true,
    formidable: {
      uploadDir
    }
  })
  app.use(bodyparser)

  const form = `
<form action='/' enctype='multipart/form-data' method='post'>
  <input type='file' name='upload' multiple='multiple' required>
  <br>
  <input type='submit' value='Upload'>
</form>`

  app.use(async (ctx, next) => {
    if (ctx.method === 'GET') {
      ctx.set('Content-Type', 'text/html')
      ctx.response.body = form
    } else if (ctx.method === 'POST') {
      let files = ctx.request.body.files.upload

      // put standalone file in array
      if (!Array.isArray(files)) {
        files = [ files ]
      }

      files.map(async (file) => {
        await fixFilename(file)
      })

      ctx.redirect('/')
    }
  })

  return app
}

module.exports = uploadServer

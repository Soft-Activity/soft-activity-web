const path = require('path')

const { generateService } = require('@umijs/openapi')

generateService({
  schemaPath: path.join(__dirname, '/src/api/api-docs.json'), // 可以是.json文件，也可以是远程json地址
  serversPath: './src/api/servers',
  requestLibPath: 'import {request} from "axios";'
})

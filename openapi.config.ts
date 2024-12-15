const path = require('path')

const { generateService } = require('@umijs/openapi')

generateService({
  schemaPath: 'http://localhost:8080/v3/api-docs', // 可以是.json文件，也可以是远程json地址
  serversPath: './src/api/servers',
  requestLibPath: 'import request from "@/axios/index"'
})

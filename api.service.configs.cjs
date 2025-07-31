/** 生成api代码路径 */
const serverPath = './src/swagger'
/** 本地运行环境地址 */
const host = 'http://127.0.0.1:4000'

/** swagger配置信息 */
const swaggerConfigs = [
  {
    schemaPath:
      'http://petstore.swagger.io/v2/swagger.json',
    projectName: 'openApi',
    /** api前缀 */
    apiPrefix: "'/openApi'",
    /** 单独导出的controller,为空时导出全部 */
    controllers: [

    ],
    // 排除
    excludeControllers: []
  }
]

module.exports = { swaggerConfigs, serverPath, host }
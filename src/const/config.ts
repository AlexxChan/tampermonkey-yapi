export interface ConfigType {
  yapiConfig: {
    url: string
    token: string
    projectId: string
  }
  // 生成模块的Index文件的内容
  renderIndex?: (...args: any) => Promise<string>
}

export const config: ConfigType = {
  // yapi的配置
  yapiConfig: {
    // url为yapi部署地址
    url: 'http://10.1.1.191:3000',
    // yapi的token,在yapi对应项目的设置的token配置页面
    token: '7a8f485e09bd0b31d0d8ecdb084d68eeea6d82c74e9e64e2103db2620d6d1fd9',
    // 项目的id
    projectId: '3371'
  }
}

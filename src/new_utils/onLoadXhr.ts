type CbType = (url: string, xhr: XMLHttpRequest) => void

const stack: CbType[] = []

export function registerXhrWatcher() {
  const originOpen = XMLHttpRequest.prototype.open
  // @ts-ignore
  XMLHttpRequest.prototype.open = function (...args) {
    const [_, _url] = args
    this.addEventListener('load', function () {
      // 因为App的文件注册的比yapi页面接口获取的晚，所以为了解决拦截不到初始的接口的问题，这里延迟400ms
      setTimeout(() => {
        stack.forEach((cb) => {
          cb(_url as string, this)
        })
      }, 400)
    })
    // eslint-disable-next-line prefer-rest-params
    originOpen.apply(this, args as any)
  }
}

export function onXhrRequest(callback: (url: string, xhr: XMLHttpRequest) => void) {
  stack.push(callback)
}

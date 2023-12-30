import { notification } from 'ant-design-vue'
import copy from 'copy-to-clipboard'

export function copyText(val: string, message = '复制成功') {
  copy(val)
  notification.success({
    placement: 'top',
    message: message
  })
}

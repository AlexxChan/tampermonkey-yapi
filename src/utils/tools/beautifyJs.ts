import { js } from 'js-beautify'

export function beautifyJs(code: string) {
  return js(code, {})
}

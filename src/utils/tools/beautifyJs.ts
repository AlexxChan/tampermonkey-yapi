import js_beautify from 'js-beautify'

export function beautifyJs(code: string) {
  return js_beautify(code, {})
}

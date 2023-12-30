import { camelCase, upperFirst } from 'lodash'

export function pascalCase(str: string) {
  return upperFirst(camelCase(str))
}

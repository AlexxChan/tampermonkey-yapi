import { JSONSchema4, JSONSchema4TypeName } from 'json-schema'
import JSON5 from 'json5'
import toJsonSchema from 'to-json-schema'
import { traverse } from '../traverse.js'
import { castArray, cloneDeep, forOwn, isArray, isEmpty, mapKeys } from 'lodash'
// 引入线上的包
import { FileData } from './helpers.js'
// @ts-ignore
import { compile } from 'json-schema-to-typescript/dist/bundle.js'

import {
  Interface,
  PropDefinition,
  MethodEnum,
  RequestBodyTypeEnum,
  RequestFormItemTypeEnum,
  RequiredEnum,
  ResponseBodyTypeEnum
} from './type.js'

// @ts-ignore
// addScript('https://cdn.jsdelivr.net/npm/json-schema-to-typescript@4.1.0/dist/bundle.js')

export function isGetLikeMethod(method: MethodEnum): boolean {
  return [MethodEnum.GET, MethodEnum.OPTIONS, MethodEnum.HEAD].includes(method)
}

export function isPostLikeMethod(method: MethodEnum): boolean {
  return !isGetLikeMethod(method)
}

// /**
//  * 将路径统一为 unix 风格的路径。
//  *
//  * @param path 路径
//  * @returns unix 风格的路径
//  */
// export function toUnixPath(path: string) {
// 	return path.replace(/[/\\]+/g, '/');
// }

/**
 * 原地遍历 JSONSchema。
 */
export function traverseJsonSchema(
  jsonSchema: JSONSchema4,
  cb: (jsonSchema: JSONSchema4, currentPath: Array<string | number>) => JSONSchema4,
  currentPath: Array<string | number> = []
): JSONSchema4 {
  // if (!isObject(jsonSchema)) return jsonSchema;
  // Mock.toJSONSchema 产生的 properties 为数组，然而 JSONSchema4 的 properties 为对象
  if (isArray(jsonSchema.properties)) {
    jsonSchema.properties = (jsonSchema.properties as JSONSchema4[]).reduce((props, js) => {
      props[js.name] = js
      return props
    }, {})
  }
  // 处理传入的 JSONSchema
  cb(jsonSchema, currentPath)
  // 继续处理对象的子元素
  if (jsonSchema.properties) {
    forOwn(jsonSchema.properties, (item, key) =>
      traverseJsonSchema(item, cb, [...currentPath, key])
    )
  }
  // 继续处理数组的子元素
  if (jsonSchema.items) {
    castArray(jsonSchema.items).forEach((item, index) =>
      traverseJsonSchema(item, cb, [...currentPath, index])
    )
  }
  // 处理 oneOf
  if (jsonSchema.oneOf)
    jsonSchema.oneOf.forEach((item: JSONSchema4) => traverseJsonSchema(item, cb, currentPath))
  // 处理 anyOf
  if (jsonSchema.anyOf)
    jsonSchema.anyOf.forEach((item: JSONSchema4) => traverseJsonSchema(item, cb, currentPath))
  //   处理 allOf
  if (jsonSchema.allOf)
    jsonSchema.allOf.forEach((item: JSONSchema4) => traverseJsonSchema(item, cb, currentPath))
  return jsonSchema
}

/**
 * 获取适用于 JSTT 的 JSONSchema。
 *
 * @param jsonSchema 待处理的 JSONSchema
 * @param _typeName
 * @returns 适用于 JSTT 的 JSONSchema
 */
export function jsonSchemaToJSTTJsonSchema(
  jsonSchema: JSONSchema4,
  _typeName: string
): JSONSchema4 {
  // 去除最外层的 description 以防止 JSTT 提取它作为类型的注释
  if (jsonSchema) delete jsonSchema.description

  return traverseJsonSchema(jsonSchema, (jsonSchema, _currentPath) => {
    // 支持类型引用
    // YApi 低版本不支持配置 title，可以在 description 里配置
    const refValue = jsonSchema.title ?? jsonSchema.description
    if (refValue?.startsWith('&')) {
      // const typeRelativePath = refValue.substring(1)
      // const typeAbsolutePath = toUnixPath(
      //   path
      //     .resolve(
      //       path.dirname(`/${currentPath.join('/')}`.replace(/\/{2,}/g, '/')),
      //       typeRelativePath
      //     )
      //     .replace(/^[a-z]+:/i, '')
      // )
      // const typeAbsolutePathArr = typeAbsolutePath.split('/').filter(Boolean)
      // let tsTypeLeft = ''
      // let tsTypeRight = typeNames
      // for (const key of typeAbsolutePathArr) {
      //   tsTypeLeft += 'NonNullable<'
      //   tsTypeRight += `[${JSON.stringify(key)}]>`
      // }
      // jsonSchema.tsType = `${tsTypeLeft}${tsTypeRight}`
    }

    // 去除 title 和 id，防止 json-schema-to-typescript 提取它们作为接口名
    delete jsonSchema.title
    delete jsonSchema.id

    // 忽略数组长度限制
    delete jsonSchema.minItems
    delete jsonSchema.maxItems
    // 将 additionalProperties 设为 false
    if (jsonSchema.type === 'object') jsonSchema.additionalProperties = false

    // 删除 default，防止 json-schema-to-typescript 根据它推测类型
    delete jsonSchema.default

    return jsonSchema
  })
}

/**
 * 原地处理 JSONSchema。
 *
 * @param jsonSchema 待处理的 JSONSchema
 * @param customTypeMapping
 * @returns 处理后的 JSONSchema
 */
export function processJsonSchema(
  jsonSchema: JSONSchema4,
  customTypeMapping: Record<string, JSONSchema4TypeName>
): JSONSchema4 {
  return traverseJsonSchema(jsonSchema, (jsonSchema) => {
    // 删除通过 swagger 导入时未剔除的 ref
    delete jsonSchema.$ref
    delete jsonSchema.$$ref

    // 数组只取第一个判断类型
    if (jsonSchema.type === 'array' && Array.isArray(jsonSchema.items) && jsonSchema.items.length) {
      jsonSchema.items = jsonSchema.items[0]
    }
    // 处理类型名称为标准的 JSONSchema 类型名称
    if (jsonSchema.type) {
      // 类型映射表，键都为小写
      const typeMapping: Record<string, JSONSchema4TypeName> = {
        byte: 'integer',
        short: 'integer',
        int: 'integer',
        long: 'integer',
        float: 'number',
        double: 'number',
        bigdecimal: 'number',
        char: 'string',
        void: 'null',
        ...mapKeys(customTypeMapping, (_item, key) => key.toLowerCase())
      }
      const isMultiple = Array.isArray(jsonSchema.type)
      const types = castArray(jsonSchema.type).map((type) => {
        // 所有类型转成小写，如：String -> string
        type = type.toLowerCase() as any
        // 映射为标准的 JSONSchema 类型
        type = typeMapping[type] || type
        return type
      })
      jsonSchema.type = isMultiple ? types : types[0]
    }

    // 移除字段名称首尾空格
    if (jsonSchema.properties) {
      forOwn(jsonSchema.properties, (_item, prop) => {
        const propDef = jsonSchema.properties![prop]
        delete jsonSchema.properties![prop]
        jsonSchema.properties![(prop as string).trim()] = propDef
      })
      if (Array.isArray(jsonSchema.required)) {
        jsonSchema.required = jsonSchema.required.map((prop) => prop.trim())
      }
    }

    return jsonSchema
  })
}

/**
 * 获得属性定义列表的 JSONSchema 对象。
 *
 * @param propDefinitions 属性定义列表
 * @param customTypeMapping
 * @returns JSONSchema 对象
 */
export function propDefinitionsToJsonSchema(
  propDefinitions: PropDefinition[],
  customTypeMapping: Record<string, JSONSchema4TypeName>
): JSONSchema4 {
  return processJsonSchema(
    {
      type: 'object',
      required: propDefinitions.reduce<string[]>((res, prop) => {
        if (prop.required) {
          res.push(prop.name)
        }
        return res
      }, []),
      properties: propDefinitions.reduce<Exclude<JSONSchema4['properties'], undefined>>(
        (res, prop) => {
          res[prop.name] = {
            type: prop.type,
            description: prop.comment,
            ...(prop.type === ('file' as any) ? { tsType: FileData.name } : {})
          }
          return res
        },
        {}
      )
    },
    customTypeMapping
  )
}

/**
 * 获得 JSON 数据的 JSONSchema 对象。
 *
 * @param json JSON 数据
 * @param customTypeMapping
 * @returns JSONSchema 对象
 */
export function jsonToJsonSchema(
  json: object,
  customTypeMapping: Record<string, JSONSchema4TypeName>
): JSONSchema4 {
  const schema = toJsonSchema(json, {
    required: false,
    arrays: { mode: 'first' },
    objects: { additionalProperties: false },
    strings: { detectFormat: false },
    postProcessFnc: (type: string, schema: any, value: any) => {
      if (!schema.description && !!value && type !== 'object') {
        schema.description = JSON.stringify(value)
      }
      return schema
    }
  })
  delete schema.description
  return processJsonSchema(schema as any, customTypeMapping)
}

/**
 * 将 JSONSchema 字符串转为 JSONSchema 对象。
 *
 * @param str 要转换的 JSONSchema 字符串
 * @param customTypeMapping
 * @returns 转换后的 JSONSchema 对象
 */
export function jsonSchemaStringToJsonSchema(
  str: string,
  customTypeMapping: Record<string, JSONSchema4TypeName>
): JSONSchema4 {
  return processJsonSchema(JSON.parse(str), customTypeMapping)
}

export function getRequestDataJsonSchema(
  interfaceInfo: Interface,
  customTypeMapping: Record<string, JSONSchema4TypeName>
): JSONSchema4 {
  let jsonSchema: JSONSchema4 | undefined
  // 处理表单数据（仅 POST 类接口）
  if (isPostLikeMethod(interfaceInfo.method)) {
    switch (interfaceInfo.req_body_type) {
      case RequestBodyTypeEnum.form:
        jsonSchema = propDefinitionsToJsonSchema(
          interfaceInfo.req_body_form.map<PropDefinition>((item) => ({
            name: item.name,
            required: item.required === RequiredEnum.true,
            type: (item.type === RequestFormItemTypeEnum.file ? 'file' : 'string') as any,
            comment: item.desc
          })),
          customTypeMapping
        )
        break
      case RequestBodyTypeEnum.json:
        if (interfaceInfo.req_body_other) {
          jsonSchema = interfaceInfo.req_body_is_json_schema
            ? jsonSchemaStringToJsonSchema(interfaceInfo.req_body_other, customTypeMapping)
            : jsonToJsonSchema(JSON5.parse(interfaceInfo.req_body_other), customTypeMapping)
        }
        break
      default:
        break
    }
  }

  // 处理查询数据
  if (isArray(interfaceInfo.req_query) && interfaceInfo.req_query.length) {
    const queryJsonSchema = propDefinitionsToJsonSchema(
      interfaceInfo.req_query.map<PropDefinition>((item) => ({
        name: item.name,
        required: item.required === RequiredEnum.true,
        type: item.type || 'string',
        comment: item.desc
      })),
      customTypeMapping
    )
    if (jsonSchema) {
      jsonSchema.properties = {
        ...jsonSchema.properties,
        ...queryJsonSchema.properties
      }
      jsonSchema.required = [
        ...(Array.isArray(jsonSchema.required) ? jsonSchema.required : []),
        ...(Array.isArray(queryJsonSchema.required) ? queryJsonSchema.required : [])
      ]
    } else {
      jsonSchema = queryJsonSchema
    }
  }

  // 处理路径参数
  if (isArray(interfaceInfo.req_params) && interfaceInfo.req_params.length) {
    const paramsJsonSchema = propDefinitionsToJsonSchema(
      interfaceInfo.req_params.map<PropDefinition>((item) => ({
        name: item.name,
        required: true,
        type: item.type || 'string',
        comment: item.desc
      })),
      customTypeMapping
    )
    if (jsonSchema) {
      jsonSchema.properties = {
        ...jsonSchema.properties,
        ...paramsJsonSchema.properties
      }
      jsonSchema.required = [
        ...(Array.isArray(jsonSchema.required) ? jsonSchema.required : []),
        ...(Array.isArray(paramsJsonSchema.required) ? paramsJsonSchema.required : [])
      ]
    } else {
      jsonSchema = paramsJsonSchema
    }
  }

  return jsonSchema || {}
}

/**
 * 获得 mockjs 模板的 JSONSchema 对象。
 *
 * @param template mockjs 模板
 * @param customTypeMapping
 * @returns JSONSchema 对象
 */
export function mockjsTemplateToJsonSchema(
  template: object,
  customTypeMapping: Record<string, JSONSchema4TypeName>
): JSONSchema4 {
  const actions: Array<() => void> = []
  // https://github.com/nuysoft/Mock/blob/refactoring/src/mock/constant.js#L27
  const keyRe = /(.+)\|(?:\+(\d+)|([+-]?\d+-?[+-]?\d*)?(?:\.(\d+-?\d*))?)/
  // https://github.com/nuysoft/Mock/wiki/Mock.Random
  const numberPatterns: string[] = ['natural', 'integer', 'float', 'range', 'increment']
  const boolPatterns: string[] = ['boolean', 'bool']
  const normalizeValue = (value: any): any => {
    if (typeof value === 'string' && value.startsWith('@')) {
      const pattern = value.slice(1)
      if (numberPatterns.some((value) => pattern.startsWith(value))) {
        return 1
      }
      if (boolPatterns.some((value) => pattern.startsWith(value))) {
        return true
      }
    }
    return value
  }
  traverse(template, (value: any, key: any, parent: { [x: string]: any }) => {
    if (typeof key === 'string') {
      actions.push(() => {
        delete parent[key]
        parent[
          // https://github.com/nuysoft/Mock/blob/refactoring/src/mock/schema/schema.js#L16
          key.replace(keyRe, '$1')
        ] = normalizeValue(value)
      })
    }
  })
  actions.forEach((action) => action())
  return jsonToJsonSchema(template, customTypeMapping)
}

export function reachJsonSchema(jsonSchema: JSONSchema4, path: string | string[]) {
  let last = jsonSchema
  for (const segment of castArray(path)) {
    const _last = last.properties?.[segment]
    if (!_last) {
      return jsonSchema
    }
    last = _last
  }
  return last
}

export function getResponseDataJsonSchema(
  interfaceInfo: Interface,
  customTypeMapping: Record<string, JSONSchema4TypeName>,
  dataKey?: string | string[]
): JSONSchema4 {
  let jsonSchema: JSONSchema4 = {}

  switch (interfaceInfo.res_body_type) {
    case ResponseBodyTypeEnum.json:
      if (interfaceInfo.res_body) {
        jsonSchema = interfaceInfo.res_body_is_json_schema
          ? jsonSchemaStringToJsonSchema(interfaceInfo.res_body, customTypeMapping)
          : mockjsTemplateToJsonSchema(JSON5.parse(interfaceInfo.res_body), customTypeMapping)
      }
      break
    default:
      // eslint-disable-next-line camelcase
      jsonSchema = { __is_any__: true }
      break
  }

  if (dataKey && jsonSchema) {
    jsonSchema = reachJsonSchema(jsonSchema, dataKey)
  }

  return jsonSchema
}

/**
 * 根据 JSONSchema 对象生产 TypeScript 类型定义。
 * @param jsonSchema JSONSchema 对象
 * @param typeName 类型名称
 * @returns TypeScript 类型定义
 */
export async function jsonSchemaToType(jsonSchema: JSONSchema4, typeName: string): Promise<string> {
  if (isEmpty(jsonSchema)) return `export type ${typeName} = unknown`

  if (jsonSchema.__is_any__) {
    delete jsonSchema.__is_any__
    return `export type ${typeName} = any`
  }

  // jstt.compile默认使用 ThisIsFakeTypeName 作为fakeName
  const fakeTypeName = 'ThisIsFakeTypeName'
  const data = jsonSchemaToJSTTJsonSchema(cloneDeep(jsonSchema), typeName)
  // console.log(111, unsafeWindow.jstt, jstt)
  const code = await compile(data, fakeTypeName, {
    bannerComment: '',
    unknownAny: true,
    style: {
      bracketSpacing: false,
      printWidth: 120,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'none',
      useTabs: true
    }
  })
  return code.replace(fakeTypeName, typeName).trim()
}

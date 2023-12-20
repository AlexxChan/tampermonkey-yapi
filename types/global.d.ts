declare interface Window {
  jstt: {
    compile: any
  }
}

// ------------------------------basic_type---------------------------------------
/** 类似于内置的省略，但严格检查过滤器。 */
declare type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
/**
 * 同 `T | T[]`。
 *
 * @public
 * @example
 * ```typescript
 * type X = OneOrMore<number> // => number | number[]
 * ```
 */
declare type OneOrMore<T> = T | T[]

/** Useful as a return type in interfaces or abstract classes with missing implementation */
declare type AsyncOrSync<T> = PromiseLike<T> | T

// ------------------------------命令---------------------------------------
declare type PathType = string

declare type CommandOption = [
  flags: string,
  description?: string,
  defaultValue?: string | boolean | string[]
]

declare type CommandReturnOptions = Record<string, any>

declare interface CommandProps {
  name: string
  description: string
  options: Array<CommandOption>
  action: (value: string, options: CommandReturnOptions) => void | Promise<void>
}

import type { ClientOptions } from '@urql/core'

export function defineUrqlConfig(
  override: DefineUrqlConfigInput,
): DefineUrqlConfigInput {
  return override
}

export type DefineUrqlConfigInput = Partial<ClientOptions> | ((provided: ClientOptions) => Partial<ClientOptions>)

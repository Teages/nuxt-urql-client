import fs from 'node:fs/promises'

import type { Nuxt } from '@nuxt/schema'
import { type Resolver, addTemplate, updateTemplates, useLogger } from '@nuxt/kit'

import { defu } from 'defu'
import { glob } from 'glob'
import { normalize } from 'pathe'
import { ofetch } from 'ofetch'

import { type IntrospectionQuery, buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql'

import type { Import } from 'unimport'
import { generate } from '@graphql-codegen/cli'

import { hash } from 'ohash'
import type { UrqlModuleOptions } from '../options'
import { getGqlTagName } from '../utils/gql-tag'

export async function setupCodegen(
  options: UrqlModuleOptions,
  nuxt: Nuxt,
  rootResolver: Resolver,
): Promise<Import[]> {
  if (
    options.codegen === false
    || Object.keys(options.clients).length === 0
  ) {
    // skip codegen
    return [{
      from: '@urql/core',
      name: 'graphql',
      as: 'gql',
    }]
  }
  const logger = useLogger('gql-codegen')

  const codegenCache = new Map<string, string>()
  const schemaCache = new Map<string, string>()

  const defaultConfig: UrqlModuleOptions['codegen'] = {
    config: {
      useTypeImports: true,
    },
    watch: {},
  }

  const getClients = Object.entries(options.clients)
    .map(([id, client]) => {
      const config = defu(client.codegen, options.codegen, defaultConfig)
      let name = id
      if ('name' in client) {
        name = client.name as string
      }

      const gqlTagName = client.gqlTagName ?? getGqlTagName(name)
      const globalGqlIdentifierName = id === 'default' && gqlTagName !== 'gql'
        ? [gqlTagName, 'gql']
        : [gqlTagName]
      const unmaskFunctionName = 'getFragmentData'

      const getSchema = config.schemaOverride
        ? () => config.schemaOverride!
        : async () => {
          const url = client.url
          if (!schemaCache.has(url)) {
            // load schema from remote
            logger.info(`Fetching schema for client ${name}`)
            const { data: schemaJSON } = await ofetch<{ data: IntrospectionQuery }>(url, {
              method: 'POST',
              body: { query: getIntrospectionQuery() },
            })
            const schema = printSchema(buildClientSchema(schemaJSON))
            schemaCache.set(url, schema)
            return schema
          }
          return schemaCache.get(url) as string
        }

      const getDocuments = config.documentsOverride
        ? () => config.documentsOverride
        : async () => {
          const skip = [
            ...nuxt.options.modulesDir,
            nuxt.options.buildDir,
            nuxt.options.serverDir,
            nuxt.options.nitro.output?.dir ?? '.output',
          ].map(dir => normalize(rootResolver.resolve(dir)))
          const dirs = (await fs.readdir(
            rootResolver.resolve('./'),
            { withFileTypes: true },
          ))
            .filter(dir => dir.isDirectory())
            .filter(({ name }) => {
              const path = normalize(rootResolver.resolve(name))
              return !skip.includes(path)
            })

          const documents = dirs.map((dir) => {
            const path = normalize(rootResolver.resolve(dir.name))
            return glob.sync(`${path}/**/*`)
          }).flat()

          return [
            ...documents,
            ...glob.sync(rootResolver.resolve('./*'), { nodir: true }),
          ].map(p => normalize(p))
        }

      return async () => ({
        id,
        schema: await getSchema(),
        documents: await getDocuments(),
        preset: 'client' as const,
        presetConfig: {
          fragmentMasking: {
            unmaskFunctionName,
          },
          ...config.presetConfig,
          gqlTagName,
        },
        pluckConfig: {
          gqlMagicComment: '__GraphQL_Disabled__',
          globalGqlIdentifierName,
          globalIdentifier: gqlTagName,
        },
        config: config.config,
      })
    })

  const codegen = async () => {
    const start = Date.now()
    logger.start('Generating GraphQL code')

    const results = (await Promise.all(
      getClients.map(async (getClient) => {
        const client = await getClient()
        const id = client.id
        return await generate({
          ignoreNoDocuments: true,
          generates: {
            [`urql-client/codegen/${id}/`]: client,
          },
          pluckConfig: client.pluckConfig,
          silent: true,
        }, false) as Array<{ filename: string, content: string }>
      }),
    )).flat()

    results.forEach(({ filename, content }) => codegenCache.set(filename, content))
    logger.success(`GraphQL codegen done in ${Date.now() - start}ms`)

    return results
  }

  // first run, then add templates to runtime
  const result = await codegen()
  result.forEach(({ filename }) => addTemplate({
    filename,
    getContents: () => codegenCache.get(filename) as string,
    write: true,
  }))

  const clients = Object.entries(options.clients)

  // add auto import
  const autoImportList: Import[] = [{
    from: '@graphql-typed-document-node/core',
    name: 'type ResultOf',
    type: true,
  }, {
    from: '@graphql-typed-document-node/core',
    name: 'type VariablesOf',
    type: true,
  }]
  const pushAutoImport = (names: string[], from: string, as?: string, type?: boolean) => {
    names.forEach((name) => {
      autoImportList.push({
        from: `#build/urql-client/codegen/${from}`,
        name,
        as,
        type,
      })
    })
  }
  clients.forEach(([id, client]) => {
    const name = 'name' in client && client.name
      ? client.name as string
      : id
    const gqlTagName = client.gqlTagName ?? getGqlTagName(name)

    // generate gql tag with client id
    addTemplate({
      filename: `urql-client/codegen/${id}/gql-client.ts`,
      getContents: () => [
        `import { ${gqlTagName} as _${gqlTagName} } from './gql'`,
        `export const ${gqlTagName}: typeof _${gqlTagName} = (source: string) => ({ ...(_${gqlTagName}(source) as any), _client: '${id}' })`,
      ].join('\n'),
      write: true,
    })

    if (id === 'default') {
      pushAutoImport([gqlTagName], `${id}/gql-client`)
      pushAutoImport([
        'type DocumentType',
        'type FragmentType',
      ], id, undefined, true)
      pushAutoImport([
        'getFragmentData',
        'makeFragmentData',
        'isFragmentReady',
      ], id)
      if (name !== 'default') {
        pushAutoImport([gqlTagName], `${id}/gql-client`, 'gql')
      }
    }
    else {
      pushAutoImport([gqlTagName], `${id}/gql-client`)
    }
  })

  if (options.codegen?.watch !== false) {
    const watchConfig = options.codegen?.watch ?? {}

    const extra = (watchConfig.extra ?? [])
      .map(doc => rootResolver.resolve(doc))
    const nitroWatch = !!watchConfig.nitro
    const reloadSchema = typeof watchConfig.nitro === 'object'
      ? watchConfig.nitro.reloadSchema ?? []
      : []

    let lock: string | undefined
    nuxt.hook('builder:watch', async (_event, path) => {
      const resolvedPath = normalize(rootResolver.resolve(path))
      const isServer = resolvedPath.startsWith(normalize(rootResolver.resolve(nuxt.options.serverDir)))

      const clients = await Promise.all(getClients.map(getClient => getClient()))

      const graphqlTags = clients.map(client => client.pluckConfig.globalGqlIdentifierName).flat()

      const files = clients.map(client => client.documents).flat()
      const extraFiles = extra
        .flatMap(doc => glob.sync(doc, { absolute: true }))
        .map(file => normalize(file))
      files.push(...extraFiles)

      if (files.includes(resolvedPath) || (isServer && nitroWatch)) {
        const changedFile = await fs.readFile(resolvedPath, 'utf-8')
        if (
          !(extraFiles.includes(resolvedPath) || graphqlTags.some(tag => changedFile.includes(tag)))
          && !(isServer && nitroWatch)
        ) {
          logger.info('GraphQL codegen skipped')
          return
        }

        const fileHash = hash(changedFile)
        if (lock === fileHash) {
          return
        }

        if (isServer && nitroWatch) {
          reloadSchema.forEach(async (clientId) => {
            const client = options.clients[clientId]
            if (!client) {
              return
            }
            const url = client.url
            schemaCache.delete(url)
          })
        }

        logger.start(`GraphQL codegen: ${path}`)
        lock = fileHash
        await codegen()
        await updateTemplates({
          filter: ({ filename }) => filename.startsWith('urql-client/codegen/'),
        })
        lock = undefined
      }
    })
  }

  return autoImportList
}

import fsp from 'node:fs/promises'
import fs from 'node:fs'

import type { Nuxt } from '@nuxt/schema'
import { type Resolver, addTemplate, updateTemplates, useLogger } from '@nuxt/kit'

import { defu } from 'defu'
import { glob } from 'glob'
import { normalize, resolve } from 'pathe'
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
  const cwd = rootResolver.resolve('.')

  const codegenCache = new Map<string, string>()
  const schemaCache = new Map<string, string>()

  const optionsOutputDir = options.codegen?.outputDir
  const outputDir = optionsOutputDir
    ? resolve(nuxt.options.rootDir, optionsOutputDir)
    : undefined
  const templateResolver = useTemplateResolver(outputDir)

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

      const documents = config.documentsOverride
        ? config.documentsOverride
        : getDefaultDocuments()

      return async () => ({
        id,
        schema: await getSchema(),
        documents,
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
            [`${id}/`]: client,
          },
          pluckConfig: client.pluckConfig,
          silent: true,
          cwd,
        }, false) as Array<{ filename: string, content: string }>
      }),
    )).flat()

    results.forEach(({ filename, content }) => codegenCache.set(filename, content))
    logger.success(`GraphQL codegen done in ${Date.now() - start}ms`)

    return results
  }

  // first run, then add templates to runtime
  const result = await codegen()
  result.forEach(({ filename }) => templateResolver.addFile(
    filename,
    () => codegenCache.get(filename) as string,
  ))

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
        from: templateResolver.resolve(from),
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
    templateResolver.addFile(
      `${id}/gql-client.ts`,
      () => [
        `/* eslint-disable */`,
        `import { ${gqlTagName} as _${gqlTagName} } from './gql'`,
        `export const ${gqlTagName}: typeof _${gqlTagName} = (source: string) => ({ ...(_${gqlTagName}(source) as any), _client: '${id}' })`,
      ].join('\n'),
    )

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
    const nitroWatch = watchConfig.nitro ?? false

    let lock: string | undefined
    nuxt.hook('builder:watch', async (event, path) => {
      const resolvedPath = normalize(rootResolver.resolve(path))

      // if the file in the outputDir, skip
      if (outputDir && resolvedPath.startsWith(outputDir)) {
        return
      }

      const clients = await Promise.all(getClients.map(getClient => getClient()))
      const graphqlTags = clients.map(client => client.pluckConfig.globalGqlIdentifierName).flat()

      const extraFiles = extra
        .flatMap(doc => glob.sync(doc, { absolute: true }))
        .map(file => normalize(file))

      const changedFile = ['add', 'change'].includes(event)
        ? await fsp.readFile(resolvedPath, 'utf-8')
        : ''

      if (!(
        // the file is in the extra list
        extraFiles.includes(resolvedPath)
        || graphqlTags.some(tag => changedFile.includes(tag))
      )) {
        return
      }

      const fileHash = hash(changedFile)
      if (lock === fileHash) {
        return
      }

      logger.start(`GraphQL codegen: ${path}`)
      lock = fileHash
      await codegen()
      await templateResolver.update()
      lock = undefined
    })

    if (nitroWatch) {
      const nitroLock = 'Nitro HMR'
      nuxt.hook('nitro:build:before', (nitro) => {
        nitro.hooks.hook('dev:reload', async () => {
          if (lock === nitroLock) {
            return
          }
          logger.start(`GraphQL codegen: Nitro HMR`)
          lock = nitroLock

          await codegen()
          await templateResolver.update()

          lock = undefined
        })
      })
    }
  }

  return autoImportList
}

function getDefaultDocuments() {
  const exts = [
    // js / ts files
    ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs', 'mts', 'cts'],

    // vue files
    ['vue'],
  ].flat()

  // Nuxt3 dirs
  const dirs = [
    'components',
    'composables',
    'content',
    'layouts',
    'middleware',
    'modules',
    'pages',
    'plugins',
    'utils',
  ]

  return [
    `{${dirs.join(',')}}/**/*.{${exts.join(',')}}`,
    `*.{${exts.join(',')}}`,
  ]
}

function useTemplateResolver(
  outputDir?: string,
): TemplateResolver {
  if (!outputDir) {
    // use vfs
    const pathPrefix = 'urql-client/codegen'
    return {
      addFile: (filename, getContents) => addTemplate({
        filename: `${pathPrefix}/${filename}`,
        getContents,
        write: true,
      }),
      update: async () => updateTemplates({
        filter: ({ filename }) => filename.startsWith(`${pathPrefix}/`),
      }),
      resolve: path => `#build/${pathPrefix}/${path}`,
    }
  }

  const contentGetter = new Map<string, () => string>()

  return {
    addFile: (filename, getContents) => {
      contentGetter.set(filename, getContents)

      const path = resolve(outputDir, filename)
      const content = getContents()

      // check dir and write file
      fs.mkdirSync(resolve(path, '..'), { recursive: true })
      fs.writeFileSync(path, content, 'utf-8')
    },
    update: async () => {
      const keys = Array.from(contentGetter.keys())
      await Promise.all(keys.map(async (key) => {
        const getContents = contentGetter.get(key)!
        const content = getContents()

        await fsp.writeFile(resolve(outputDir, key), content, 'utf-8')
      }))
    },
    resolve: path => resolve(outputDir, path),
  }
}

interface TemplateResolver {
  addFile: (
    filename: string,
    getContents: () => string,
  ) => void
  update: () => Promise<void>
  resolve: (path: string) => string
}

import { readFile } from 'node:fs/promises'

import type { Nuxt } from '@nuxt/schema'
import { createResolver, useLogger } from '@nuxt/kit'

import { hash } from 'ohash'
import { defu } from 'defu'
import { glob } from 'glob'
import { normalize } from 'pathe'

import { generate } from '@graphql-codegen/cli'

import type { UrqlModuleOptions } from './options'
import { addTsTemplate } from './utils/typescript'

export async function setupCodegen(
  options: UrqlModuleOptions,
  nuxt: Nuxt,
) {
  if (
    options.codegen === false
    || Object.keys(options.clients).length === 0
  ) {
    // skip codegen
    addTsTemplate({
      filename: 'urql-client/gql/index.ts',
      content: `export { gql as graphql } from '@urql/core'`,
    })
    return
  }

  const defaultConfig: UrqlModuleOptions['codegen'] = {
    config: {
      useTypeImports: true,
    },
    watch: {},
    path: 'gql',
  }
  const config = defu(options.codegen, defaultConfig)

  // utils
  const logger = useLogger('urql-client:codegen')
  const resolver = createResolver(nuxt.options.rootDir)
  const { resolve } = resolver

  // prepare path
  const generatePath = resolve(config.path)

  // prepare schema
  const schema = config.schemaOverride || [
    ...Object.values(options.clients).map(client => client.url),
  ]

  // prepare documents
  const documentsRaw = config.documentsOverride ?? [
    '**/*',
    'app.vue',
  ]
  const documents = ((
    Array.isArray(documentsRaw)
      ? documentsRaw
      : [documentsRaw]
  ) as string[]).map(doc => resolve(doc))

  // check if the schema is exists
  const schemaPaths = Array.isArray(schema) ? schema : [schema]
  const schemaFiles = schemaPaths
    .flatMap(schemaPath => resolve(schemaPath.toString()))
    .flatMap(schemaPath => glob.sync(schemaPath.toString(), { absolute: true }))
  if (schemaFiles.length === 0) {
    logger.warn('No schema file is found.')
  }

  const generateCode = async () => {
    const start = Date.now()

    try {
      await generate({
        schema: schemaFiles,
        documents: [
          ...documents,
          '!**/node_modules/**',
        ],
        ignoreNoDocuments: true,
        generates: {
          [`${generatePath}/`]: {
            preset: 'client',
            presetConfig: config.presetConfig,
            config: config.config,
          },
        },
        silent: true,
      }, true)

      logger.success(`GraphQL codegen done in ${Date.now() - start}ms`)
      return true
    }
    catch (e) {
      logger.warn(`GraphQL codegen failed after ${Date.now() - start}ms`)
      logger.warn(e)
      return false
    }
  }

  logger.start('Generating GraphQL code')
  await generateCode()
  addTsTemplate({
    filename: 'urql-client/gql/index.ts',
    content: `export { graphql } from '${generatePath}'`,
    write: true,
  })

  if (config.watch) {
    const extra = (config.watch.extra ?? [])
      .map(doc => resolve(doc))

    let lock: string | undefined
    nuxt.hook('builder:watch', async (_event, path) => {
      const resolvedPath = normalize(resolve(path))

      const files = documents
        .flatMap(doc => glob.sync(doc, { absolute: true }))
        .map(file => normalize(file))

      const extraFiles = extra
        .flatMap(doc => glob.sync(doc, { absolute: true }))
        .map(file => normalize(file))

      files.push(...extraFiles)

      if (files.includes(resolvedPath)) {
        const changedFile = await readFile(resolvedPath, 'utf-8')
        if (!(changedFile.includes('gql') || extraFiles.includes(resolvedPath))) {
          logger.info('GraphQL codegen skipped')
          return
        }

        const fileHash = hash(changedFile)
        if (lock === fileHash) {
          return
        }

        logger.start(`GraphQL codegen: ${path}`)
        lock = fileHash
        await generateCode()
        lock = undefined
      }
    })
  }
}

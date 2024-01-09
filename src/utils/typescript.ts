import { addTemplate, addTypeTemplate } from '@nuxt/kit'
import ts from 'typescript'

/**
 * Compiles TypeScript Codes
 */
export function compileTs(
  files: File[],
  compilerOptions: ts.CompilerOptions = {},
): File[] {
  const outputFiles: File[] = []

  const compilerHost = ts.createCompilerHost(compilerOptions)
  compilerHost.readFile = filename => files.find(file => file.filename === filename)?.content
  compilerHost.writeFile = (filename, content) => {
    const file = files.find(file => file.filename === filename)
    if (file) {
      file.content = content
    }
    else {
      outputFiles.push({ filename, content })
    }
  }

  const program = ts.createProgram(files.map(file => file.filename), compilerOptions, compilerHost)
  program.emit()

  return outputFiles
}

export function addTsTemplate(
  file: {
    filename: string
    content: string
    write?: boolean
  },
) {
  const res = compileTs([file], {
    declaration: true,
    module: ts.ModuleKind.ESNext,
  })
  const jsFile = res.find(file => file.filename.endsWith('.js'))
  const dtsFile = res.find(file => file.filename.endsWith('.d.ts'))
  if (!jsFile || !dtsFile) {
    throw new Error('Failed to compile typescript')
  }
  addTemplate({
    filename: jsFile.filename.replace(/\.js$/, '.mjs'),
    getContents: () => jsFile.content,
    write: file.write,
  })
  addTypeTemplate({
    filename: dtsFile.filename,
    getContents: () => dtsFile.content,
  })
}

interface File {
  filename: string
  content: string
}

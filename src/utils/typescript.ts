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
  compilerHost.writeFile = (filename, content) => {
    outputFiles.push({ filename, content })
  }
  compilerHost.getSourceFile = (filename, languageVersion) => {
    const file = files.find(file => file.filename === filename)
    if (file) {
      return ts.createSourceFile(filename, file.content, languageVersion)
    }
  }

  const program = ts.createProgram(
    files.map(file => file.filename),
    compilerOptions,
    compilerHost,
  )
  const emitResult = program.emit()
  if (emitResult.emitSkipped) {
    throw new Error(
      emitResult.diagnostics
        .map(diagnostic => diagnostic.messageText)
        .join('\n'),
    )
  }

  return outputFiles
}
interface File {
  filename: string
  content: string
}

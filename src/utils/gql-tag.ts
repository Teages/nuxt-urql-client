export function getGqlTagName(name: string) {
  if (name === 'default') {
    return 'gql'
  }
  return `gql${upperCamelCase(name)}`
    .toLowerCase() // TODO: remove this line after https://github.com/ardatan/graphql-tools/pull/5945
}

export function getUtilsName(name: string) {
  return `gql${upperCamelCase(name)}Utils`
}

function upperCamelCase(str: string) {
  return str.replace(/([_\W])(\w)/g, (_, __, c) => c.toUpperCase())
    .replace(/^(\w)/, c => c.toUpperCase())
}

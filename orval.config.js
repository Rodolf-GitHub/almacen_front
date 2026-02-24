// orval.config.js para Almacen
module.exports = {
  petstore: {
    input: './src/api/openapi/openapi.json',
    output: {
      mode: 'single',
      target: './src/api/generated.ts',
      client: 'fetch',
      schemas: './src/api/schemas',
    },
  },
}

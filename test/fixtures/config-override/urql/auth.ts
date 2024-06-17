export default defineUrqlConfig(() => {
  return {
    fetchOptions: {
      headers: {
        Authorization: `Bearer 456`,
      },
    },
  }
})

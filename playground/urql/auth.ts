export default defineUrqlConfig(() => {
  return {
    fetchOptions: {
      headers: {
        Authorization: `Bearer override`,
      },
    },
  }
})

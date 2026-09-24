export function setNoIndex() {
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="robots"]')
    .forEach((meta) => {
      meta.content = 'noindex, nofollow'
    })
}

export function restoreIndex() {
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="robots"]')
    .forEach((meta) => {
      meta.content = 'index, follow'
    })
}
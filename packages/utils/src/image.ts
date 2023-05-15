import { fetchIpfs } from './ipfs'

export function clipImage(
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  outputWidth: number,
  outputHeiht: number,
) {
  const canvas = document.createElement('canvas')

  canvas.width = outputWidth

  canvas.height = outputHeiht

  const ctx = canvas.getContext('2d')

  ctx?.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL()
}

export async function fetchImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export function imageToBase64(image: HTMLImageElement) {
  return clipImage(image, 0, 0, image.width, image.height, image.width, image.height)
}

export async function fetchImageFromIpfs(cid: string) {
  const resp = await fetchIpfs(cid)

  const blob = await resp.blob()

  return URL.createObjectURL(blob)
}

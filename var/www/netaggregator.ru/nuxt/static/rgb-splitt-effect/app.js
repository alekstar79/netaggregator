const rOffsetInput = document.getElementById('rOffset')
const gOffsetInput = document.getElementById('gOffset')
const bOffsetInput = document.getElementById('bOffset')

const canvas = document.getElementById('canvas')
const image = document.getElementById('source')

if (image.complete) init()

image.addEventListener('load', init)

function init()
{
    const ctx = canvas.getContext('2d')
    const width = image.naturalWidth
    const height = image.naturalHeight

    canvas.width = width
    canvas.height = height

    ctx.drawImage(image, 0, 0, width, height)

    const imageData = ctx.getImageData(0, 0, width, height)

    rOffsetInput.addEventListener('change', updateCanvas)
    gOffsetInput.addEventListener('change', updateCanvas)
    bOffsetInput.addEventListener('change', updateCanvas)

    function updateCanvas()
    {
        const updatedImageData = rgbSplit(imageData, {
            rOffset: Number(rOffsetInput.value),
            gOffset: Number(gOffsetInput.value),
            bOffset: Number(bOffsetInput.value)
        })

        ctx.putImageData(updatedImageData, 0, 0)
    }
}

function rgbSplit(imageData, options)
{
    const { rOffset = 0, gOffset = 0, bOffset = 0 } = options,
        arr = new Uint8ClampedArray(imageData.data)

    for (let i = 0; i < arr.length; i += 4) {
        arr[i + rOffset * 4] = imageData.data[i]
        arr[i + 1 + gOffset * 4] = imageData.data[i + 1]
        arr[i + 2 + bOffset * 4] = imageData.data[i + 2]
    }

    return new ImageData(arr, imageData.width, imageData.height)
}

export function readFile(file)
{
    return new Promise((resolve, reject) => {
        const r = new FileReader()

        r.onload = resolve
        r.onerror = reject

        r.readAsDataURL(file)
    })
}

/** @see https://www.youtube.com/watch?v=6prlWtOBIX8 */

let audio, context, analyser, src, array, logo

logo = document.getElementById('logo').style
audio = document.getElementById('audio')

window.onclick = () => {
    if (!context) {
        preparation()
    }
    if (audio.paused) {
        audio.play()
        loop()
    } else {
        audio.pause()
    }
}

function preparation()
{
    context = new AudioContext()
    analyser = context.createAnalyser()
    src = context.createMediaElementSource(audio)
    src.connect(analyser)
    analyser.connect(context.destination)
    loop()
}

function loop()
{
    if (!audio.paused) {
        window.requestAnimationFrame(loop)
    }

    array = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(array)

    logo.minHeight = (array[40]) + 'px'
    logo.width = (array[40]) + 'px'
}

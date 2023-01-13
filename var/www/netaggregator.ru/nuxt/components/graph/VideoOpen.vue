<template>
    <v-card class="video-dialog__card" :class="{ fullscreen: mobile }" elevation="0">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <template v-if="mobile && $store.state.app.vkapp">
            <v-layout class="video-dialog__btn-wrapper" justify-start>
                <v-btn @click="closeWebcam" icon>
                    <v-icon>mdi-window-close</v-icon>
                </v-btn>
                <v-btn @click="pasteFromCam" icon>
                    <v-icon>mdi-check</v-icon>
                </v-btn>
            </v-layout>
        </template>
        <template v-else>
            <v-tabs :color="color" class="video-dialog__tabs-header" height="60px" hide-slider grow>
                <v-tab @click="closeWebcam" :ripple="false">
                    <v-icon :color="color">mdi-window-close</v-icon>
                </v-tab>
                <v-tab @click="pasteFromCam" :ripple="false">
                    <v-icon :color="color">mdi-check</v-icon>
                </v-tab>
            </v-tabs>
        </template>

        <v-card-text class="video-dialog__card-pane">
            <v-layout class="pane" ref="wrapper">
                <video ref="video" muted />
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    // import { nextFrame, cancelFrame } from '~/utils/callbacks.mjs'
    // import * as faceapi from 'face-api.js'

    export default {
        props: ['videostream'],

        data: () => ({
            videotrack: null,
            streaming: false,
            canvas: null
            // frame: null
        }),
        computed: {
            color() {
                return this.$vuetify.theme.dark ? 'gray' : this.$store.state.app.color
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            }
        },
        watch: {
            videostream: 'setTrack'
        },
        methods: {
            canplay()
            {
                const { video } = this.$refs

                video.addEventListener('canplay', () => {
                    let { height: screenHeight, width: screenWidth } = this.$screen,
                        { videoHeight, videoWidth } = video,
                        height,
                        width

                    if (this.mobile) {
                        height = Math.floor(screenHeight)
                        width = Math.floor(screenWidth)
                    } else {
                        height = Math.floor(videoHeight)
                        width = Math.floor(videoWidth)
                    }

                    video.setAttribute('height', height)
                    video.setAttribute('width', width)
                })

                this.streaming = true
            },
            /* play()
            {
                const { video } = this.$refs, self = this

                video.addEventListener('play', () => {
                    const size = { width: video.width, height: video.height },
                        canvas = faceapi.createCanvasFromMedia(video),
                        ctx = canvas.getContext('2d')

                    faceapi.matchDimensions(canvas, size)

                    self.$refs.wrapper.append(canvas)
                    self.canvas = canvas

                    ;(function loop() {
                        self.frame && cancelFrame(self.frame)

                        if (!self.canvas || self.stop) return

                        const options = new faceapi.TinyFaceDetectorOptions()

                        faceapi.detectAllFaces(video, options)
                            .then(faces => {
                                ctx.clearRect(0, 0, canvas.width, canvas.height)
                                faceapi.draw.drawDetections(canvas, faceapi.resizeResults(faces, size))
                                self.stop || (self.frame = nextFrame(loop))
                            })
                    })()
                })
            }, */
            cleanWrapper()
            {
                this.$nextTick(() => {
                    /** @type Element */
                    const wrapper = this.$refs.wrapper

                    wrapper.querySelectorAll('canvas').forEach(el => {
                        el.parentNode.removeChild(el)
                    })
                })
            },
            /* stopLoop()
            {
                this.frame && cancelFrame(this.frame)

                this.frame = null
                this.stop = true
            }, */
            setTrack(stream)
            {
                stream || (stream = this.videostream)

                if (!stream) return

                this.cleanWrapper()
                this.videotrack = stream.getTracks()[0]
                // this.stop = false

                this.$nextTick(() => {
                    this.$refs.video.onloadedmetadata = () => {
                        this.$refs.video.play()
                    }

                    if (!this.streaming) {
                        this.canplay()
                        // this.play()
                    }
                    if ('srcObject' in this.$refs.video) {
                        this.$refs.video.srcObject = stream
                    } else {
                        this.$refs.video.src = URL.createObjectURL(stream)
                    }
                })
            },
            pasteFromCam()
            {
                const { videoHeight, videoWidth } = this.$refs.video,
                    tmp = document.createElement('canvas'),
                    ctx = tmp.getContext('2d')

                tmp.height = videoHeight
                tmp.width = videoWidth

                ctx.drawImage(/** @type HTMLVideoElement */ this.$refs.video, 0, 0)

                this.$emit('open', { src: tmp.toDataURL('image/png') })

                this.closeWebcam()
            },
            closeWebcam()
            {
                // this.stopLoop()
                this.cleanWrapper()

                if (this.videotrack) {
                    this.videotrack.stop()
                    this.videotrack = null
                }
                if (this.$refs.video) {
                    this.$refs.video.pause()
                    this.$refs.video.src = ''
                }
                if (this.videostream) {
                    this.videostream = null
                }

                this.$nextTick().then(() => {
                    this.$emit('close')
                })
            }
        },
        mounted()
        {
            this.videostream && this.setTrack()
        }
    }
</script>

<style lang="scss" scoped>
    .video-dialog__card {
        .video-dialog__btn-wrapper {
            max-height: 60px;
            padding: 0 10px;

            ::v-deep .v-btn {
                cursor: pointer;
                margin: 0 5px;

                &:hover::before {
                    background-color: currentColor;
                }
            }
        }
        .video-dialog__tabs-header {
            border-bottom: 1px solid #e3e4e8;
            max-width: 100%;

            .v-tab {
                min-width: unset !important;
                max-width: 50% !important;
                padding: 0;
            }
        }
        .video-dialog__card-pane {
            min-height: 320px;
            min-width: 320px;
            padding: 0;

            .pane {
                display: flex;
                justify-content: center;
                align-items: center;
                flex: unset;

                /* canvas {
                    position: absolute;
                } */
                video {
                    object-fit: cover;
                    max-width: 540px;
                    height: 100%;
                }
            }
        }
        &.fullscreen {
            min-height: 100%;
            height: 100%;

            ::v-deep .video-dialog__card-pane {
                max-height: calc(100vh - 86px);
            }
        }
        &.theme--dark {
            .video-dialog__tabs-header {
                border-color: #8f8f8f;
            }
        }
    }
    @media all and (max-width: 320px) {
        ::v-deep .video-dialog__card-pane {
            height: calc(100vh - 61px);
        }
    }
</style>

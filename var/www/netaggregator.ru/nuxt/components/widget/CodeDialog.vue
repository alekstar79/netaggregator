<template>
    <v-card class="code-editor" :class="{ fullscreen }">
        <v-system-bar v-if="mobile && $store.state.app.vkapp" height="26px" color="transparent" />

        <v-card-text class="code" :style="{ /* maxHeight */ }">
            <client-only v-if="$store.state.app.codemirror && set">
                <codemirror v-model="code" :options="options" @ready="onReady" />
            </client-only>
        </v-card-text>

        <v-card-actions class="justify-space-between">
            <div class="editor-controls left">
                <v-btn @click="undo" :color="color" :disabled="history.undo <= 0" icon>
                    <v-icon dense>mdi-undo-variant</v-icon>
                </v-btn>

                <v-btn @click="redo" :color="color" :disabled="history.redo <= 0" icon>
                    <v-icon dense>mdi-redo-variant</v-icon>
                </v-btn>

                <v-btn @click="lineWrap" :color="color" icon>
                    <v-icon dense>mdi-wrap</v-icon>
                </v-btn>
            </div>

            <div class="editor-controls right">
                <v-btn @click="close(true)" :color="color" :disabled="saved" icon>
                    <v-icon dense>mdi-check</v-icon>
                </v-btn>

                <v-btn @click="close()" :color="color" icon>
                    <v-icon dense>mdi-close</v-icon>
                </v-btn>
            </div>
        </v-card-actions>
    </v-card>
</template>

<script>
    // import { debounce } from '~/utils/common/debounce.mjs'

    import { error, success } from '~/utils/widget'
    import { codemirror } from '~/mixins/common'

    export default {
        mixins: [codemirror],

        props: {
            fullscreen: {
                required: true,
                type: Boolean
            },
            set: {
                required: true,
                type: String
            }
        },
        data: () => ({
            maxHeight: '640px',
            codemirror: null,
            code: '',

            wrap: false,
            saved: true,

            options: {
                mode: 'text/javascript',
                theme: 'material',
                autofocus: true,
                tabSize: 4,

                styleSelectedText: false,
                styleActiveLine: true,
                lineWrapping: false,
                lineNumbers: true,
                line: true,

                showCursorWhenSelecting: true,
                autoRenameTags: true,
                markTagPairs: true,
                jsxBracket: true,
                keyMap: 'sublime',

                matchBrackets: true,
                matchTags: {
                    bothTags: true
                },

                foldGutter: true,
                gutters: [
                    'CodeMirror-linenumbers',
                    'CodeMirror-foldgutter'
                ],

                highlightSelectionMatches: {
                    annotateScrollbar: true,
                    showToken: /\w/
                },

                hintOptions: {
                    completeSingle: false
                }
            }
        }),
        computed: {
            history() {
                return this.codemirror ? this.codemirror.historySize() : { redo: 0, undo: 0 }
            },
            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            // '$store.state.app.window': 'update',
            set: 'check',

            history: {
                deep: true,
                handler({ undo }) {
                    this.saved = undo <= 0
                }
            }
        },
        methods: {
            /* measure()
            {
                let h

                if ((h = this.$el.clientHeight)) {
                    this.maxHeight = Math.ceil(h * .9) + 'px'
                }
            }, */
            undo()
            {
                this.codemirror.undo()
            },
            redo()
            {
                this.codemirror.redo()
            },
            preliminary()
            {
                const expr = /\/\/ (\w+)-g\d+-\w+\n+/gm,
                    call = Function.prototype.call,
                    trim = String.prototype.trim,
                    code = this.code.trim()

                return code.match(expr)
                    ? code.split(expr).map(call, trim).filter(Boolean)
                    : null
            },
            packup(array)
            {
                const set = {}

                for (let i = 0; i < array.length; i += 2) {
                    if (array[i] === 'return') continue
                    set[array[i]] = array[i + 1]
                }

                return set
            },
            parse({ data = '' })
            {
                let decode = (_, d) => String.fromCharCode(d),
                    raw = /var\s+\w+\s*=\s*({(\s*.*)+})/gm.exec(data),
                    ret = null

                if (raw && raw[1]) {
                    raw = raw[1].split('\n')
                        .map(s => s.replace(/[']([^']+)[']/g, '"$1"'))
                        .map(s => s.replace(/(\w+(?=:))/g, '"$1"'))
                        .map(s => s.replace(/&#(\d+);/g, decode))
                        .join('\n')

                    try {

                        ret = JSON.parse(raw)

                    } catch (e) {
                    }
                }

                return ret
            },
            save()
            {
                const init = this.preliminary()

                if (!init || init.length > 8 || init.length % 2 !== 0) {
                    this.$bus.$emit('snack', error())
                    return null
                }

                const set = this.packup(init),
                    data = this.parse(set)

                if (data) {
                    const { variables, logic } = set

                    this.$bus.$emit('snack', success('commom.saved'))
                    this.saved = true

                    return { variables, logic, ...data }
                }

                this.$bus.$emit('snack', error('Parse error'))

                return null
            },
            lineWrap()
            {
                this.codemirror.setOption('lineWrapping', (this.wrap = !this.wrap))
            },
            onReady(cm)
            {
                this.codemirror = cm

                setTimeout(() => {
                    this.code = this.set
                    this.clear()
                }, 500)
            },
            clear()
            {
                setTimeout(() => {
                    this.codemirror.clearHistory()
                    this.saved = true
                }, 250)
            },
            check(code)
            {
                !code && this.close()
            },
            close(apply = false)
            {
                this.$emit('update', apply ? this.save() : null)
            }
            /* update: debounce(function() {
                this.measure()
            }, 100) */
        },
        created()
        {
            this.cmImport()
        }
        /* mounted()
        {
            this.update()
        } */
    }
</script>

<style lang="scss" scoped>
    .code-editor {
        display: flex;
        flex-direction: column;
        height: 100%;

        &.fullscreen {
            ::v-deep .v-card__text.code {
                height: 100%;

                .vue-codemirror {
                    min-height: 90%;
                    height: 100%;
                }
                .CodeMirror {
                    max-height: 100%;
                    height: 100%;
                }
            }
            ::v-deep .v-card__actions {
                position: absolute;
                z-index: 99;
                bottom: 5px;
                right: 5px;
            }
        }
        ::v-deep .v-card__text.code {
            flex: 2 1 100px;
            padding: 15px 15px 0 !important;

            .vue-codemirror, .CodeMirror {
                max-height: 500px;
                min-height: 500px;
            }
        }
        ::v-deep .v-card__actions {
            margin: 0 5px;
            padding: 8px;
            height: 70px;

            line-height: unset;

            .v-btn:hover::before {
                background-color: currentColor;
            }
        }
    }
</style>

<script>
    const supportedModifiers = ['altKey', 'metaKey', 'ctrlKey', 'shiftKey']

    /**
    * @see https://github.com/lupas/vue-keypress
    */
    export default {
        props: {
            keyEvent: {
                type: String,
                default: 'keyup'
            },
            keyCode: {              // for single key code
                type: Number,
                default: null
            },
            modifiers: {            // shiftKey | ctrlKey | altKey | metaKey
                type: Array,
                default: () => []
            },
            multipleKeys: {         // for multiple key codes
                type: Array,
                default: () => []
            },
            preventDefault: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            keyListeners: []
        }),
        methods: {
            setupListeners()
            {
                this.addEventListener({
                    keyEvent: this.keyEvent,
                    keyCode: this.keyCode,
                    preventDefault: this.preventDefault,
                    modifiers: this.modifiers,
                    multipleKeys: this.multipleKeys
                })
            },
            addEventListener(expectedEvent)
            {
                const listener = this.eventHandler(expectedEvent)

                window.addEventListener(expectedEvent.keyEvent, listener)

                this.keyListeners.push({ expectedEvent, listener })
            },
            removeEventListeners()
            {
                for (const { keyEvent, listener } of this.keyListeners) {
                    window.removeEventListener(keyEvent, listener)
                }
            },
            eventHandler(expectedEvent)
            {
                return event => {
                    const emit = (emitEvent, message) => this.$emit(emitEvent, { event, expectedEvent, message }),
                        multipleKeysMode = expectedEvent.multipleKeys.length > 0

                    if (!expectedEvent.keyCode && !multipleKeysMode) {
                        emit('success', 'Any key was pressed')
                        return
                    }

                    const expectedInputs = multipleKeysMode
                        ? expectedEvent.multipleKeys
                        : [expectedEvent]

                    for (const expectedInput of expectedInputs) {
                        if (expectedInput.keyCode !== event.keyCode) continue

                        if (expectedInput.modifiers.length > 0) {
                            const modifiersPressed = supportedModifiers.every(x => event[x] === (expectedInput.modifiers.includes(x)))
                            if (!modifiersPressed) continue
                        }
                        if (expectedEvent.preventDefault) {
                            event.preventDefault()
                        }

                        emit('success', 'Correct key(s) pressed')

                        return
                    }

                    emit('wrong', 'Wrong key(s) pressed')
                }
            }
        },
        destroyed()
        {
            this.removeEventListeners()
        },
        mounted()
        {
            this.setupListeners()
        }
    }
</script>

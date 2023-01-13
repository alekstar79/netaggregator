export default {
    methods: {
        append({ clientX, clientY }, { claz })
        {
            const entity = claz === 'emoticon' ? 'emoji' : 'dialog',
                handler = this.insert,
                x = clientX,
                y = clientY,
                z = 300

            this.$store.commit('chatbot/set', {
                [entity]: {
                    show: true,
                    handler,
                    x,
                    y,
                    z
                }
            })

            this.$refs.textarea.focus()
        },
        insert(variable)
        {
            if (!variable) return

            let input = this.$refs.textarea.$refs.input,
                { selectionStart: start, selectionEnd: end, value } = input,
                next = value.substring(end, value.length),
                prev = value.substring(0, start)

            this.value = { ...this.value, text: prev + variable + next }

            this.$nextTick(() => {
                start += variable.length
                input.selectionStart = input.selectionEnd = start
                input.focus()
            })
        }
    }
}

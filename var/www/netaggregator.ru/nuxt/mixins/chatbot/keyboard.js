import { kvPayload, clearBtn, clone } from '~/utils/chatbot'

export default {
    data: () => ({
        colors: [
            { value: '#5181b8', text: 'Primary'   },
            { value: '#e5ebf1', text: 'Secondary' },
            { value: '#4bb34b', text: 'Positive'  },
            { value: '#e64646', text: 'Negative'  }
        ],

        editContentMarker: false,
        editStructMarker: false,

        redact: clearBtn()
    }),
    methods: {
        editContent(config)
        {
            const cloned = clone(config),
                bg = cloned.props.background.value || cloned.props.background,
                color = this.colors.find(c => c.value === bg)

            cloned.props.payload = Object.entries(cloned.props.payload)
                .map(([k, v]) => `${k}:${v}`)

            cloned.props.background = (color || {}).value || '#5181b8'

            this.redact = cloned
            this.editContentMarker = true
        },
        apply(done)
        {
            const { handler } = this.$store.state.chatbot.keyboard

            if (typeof handler !== 'function') {
                throw new TypeError('Unexpected internal typing error')
            }

            this.redact.props.background = this.redact.props.background.value || this.redact.props.background

            this.redact.props.payload = this.redact.props.payload
                .filter(v => v.includes(':'))
                .reduce(kvPayload, {})

            handler({ done, config: this.redact })

            this.editContentMarker = false
            this.redact = clearBtn()
        }
    },
    beforeDestroy()
    {
        this.$bus.$off('edit', this.editContent)
    },
    created()
    {
        this.$bus.$on('edit', this.editContent)
    }
}

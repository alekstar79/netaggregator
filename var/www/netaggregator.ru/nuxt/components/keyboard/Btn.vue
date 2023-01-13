<template>
    <lazy-keyboard-cell
        v-bind="cellProps"
        :key="config.id"
        :display="display"
        :draggable="editable"
        @delete:content="$listeners['delete:content']"
        @edit:content="editContent"
    >
        <div class="Composer_Button" :style="{ background }">
            <p>{{ config.props.text | cut }}<sup v-if="payload">*</sup></p>
        </div>
    </lazy-keyboard-cell>
</template>

<script>
    export default {
        name: 'Btn',

        props: {
            initialConfig: Object,
            editable: Boolean,
            cellProps: Object
        },
        filters: {
            cut(text)
            {
                return text.length > 10 ? text.slice(0, 9) + '…' : text
            }
        },
        computed: {
            payload() {
                return Object.keys(this.config.props.payload).length
            },
            background() {
                return this.config.props.background || '#5181b8'
            },
            display() {
                return this.config.display || { weight: 1 }
            }
        },
        data: () => ({
            config: { props: {} }
        }),
        methods: {
            getConfig()
            {
                return this.config
            },
            editContent()
            {
                this.$store.commit('chatbot/set', { keyboard: { handler: this.updateText } })

                this.$bus.$emit('edit', this.config)
            },
            updateText({ done, config })
            {
                this.$store.commit('chatbot/set', { keyboard: { handler: null } })

                if (done) {
                    this.config = config
                }
            }
        },
        created()
        {
            this.config = { ...this.initialConfig }
        }
    }
</script>

<style lang="scss" scoped>
    .Composer_Button {
        height: 40px;
        padding: 0 7px;
        border-radius: 3px;

        p {
            margin: 0;
            text-align: center;
            line-height: 40px;
            color: #fff;

            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
</style>

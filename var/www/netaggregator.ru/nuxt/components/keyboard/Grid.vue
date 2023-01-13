<template>
    <div class="LayoutComposer">
        <slot v-bind="internalConfig" name="header" />

        <lazy-keyboard-layout
            ref="root"
            @remove="removeContent"
            v-bind="internalConfig.props || {}"
            v-show="(internalConfig.children || []).length"
            :initial-config="internalConfig"
            :editable="editable"
            :key="force"
            :cell-props="{
                id: internalConfig.id,
                layoutOrientation: '',
                isFirstChild: true,
                dragging
            }"
        />
    </div>
</template>

<script>
    import { setIds } from '~/utils/composer'
    import { clone } from '~/utils/chatbot'

    const availableRow = c => c.children.findIndex(r => r.children.length < 5),

        row = () => ({
            component: 'keyboard-layout',
            props: {
                orientation: 'horizontal'
            },
            children: []
        }),

        btn = () => ({
            component: 'keyboard-btn',
            display: { weight: 1 },
            props: {
                background: '#5181b8',
                text: 'Button',
                payload: {}
            }
        })

    export default {
        name: 'Grid',

        props: {
            editable: Boolean,
            config: Object
        },
        watch: {
            editable(v) {
                v || this.$emit('change:config', this.getConfig())
                this.force = !this.force
            }
        },
        data: () => ({
            dragging: false,
            force: false,

            internalConfig: {
                children: [],
                props: {}
            }
        }),
        methods: {
            externalUpdate(config)
            {
                const cloned = clone(config)

                setIds(cloned)

                this.internalConfig = cloned
                this.force = !this.force
            },
            insert(entity)
            {
                if (!this.editable) return

                let config = clone(this.getConfig()),
                    i = availableRow(config)

                if (config.children.length >= 10 && i < 0) return

                switch (entity) {
                    case 'row':
                        if (config.children.length < 10) {
                            config.children.push(row())
                        }
                        break
                    case 'btn':
                        if (i < 0) {
                            config.children.push(row())
                            i = availableRow(config)
                        }
                        if (i > -1) {
                            config.children[i].children.push(btn())
                        }
                }

                this.externalUpdate(config)
            },
            removeContent()
            {
                this.internalConfig = clone(this.getConfig())
            },
            getConfig()
            {
                return this.$refs.root.getConfig()
            },
            dragstart()
            {
                this.$nextTick(() => {
                    this.dragging = true
                })
            },
            dragover(e)
            {
                e.preventDefault()

                if (!this.editable) {
                    return true
                }
            },
            drop(e)
            {
                e.preventDefault()
            }
        },
        beforeDestroy()
        {
            document.removeEventListener('dragstart', this.dragstart)
            document.removeEventListener('dragover', this.dragover)
            document.removeEventListener('drop', this.drop)

            window.documentHasDropListener = false
        },
        mounted()
        {
            if (window.documentHasDropListener) return

            document.addEventListener('dragstart', this.dragstart)
            document.addEventListener('dragover', this.dragover)
            document.addEventListener('drop', this.drop)

            this.$bus.$on('global:dragend', () => {
                if (!this.editable) return false

                this.$nextTick(() => {
                    this.dragging = false
                })
            })

            window.documentHasDropListener = true
        },
        created()
        {
            this.externalUpdate(this.config)
        }
    }
</script>

<style scoped>
    .LayoutComposer {
        height: 100%;
    }
</style>

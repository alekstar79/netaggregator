<template>
    <div class="rg-menu-wrapper unselectable track" :class="themeClasses">
        <v-menu
            content-class="rulers-menu"
            transition="slide-x-transition"
            close-on-content-click
            close-on-click
            max-width="210px"
            min-width="210px"
            bottom
            right
        >
            <template #activator="{ on }">
                <v-icon v-on="on" dense>
                    mdi-menu
                </v-icon>
            </template>

            <v-list :key="grid" dense>
                <v-list-item v-for="(item, i) in list" @click.stop="choice(item)" :disabled="item.disabled" :key="i">
                    <v-list-item-title class="unselectable">
                        <span class="menu-title">
                            {{ item.text }}
                        </span>

                        <span class="menu-hotkey">
                            {{ item.hotkey }}
                        </span>
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>

    // menu ☰ &#9776;
    export default {
        props: ['canvas'],

        computed: {
            guidesList() {
                return this.$store.state.canvas.guidesList
            },
            gridList() {
                return this.$store.state.canvas.gridList
            },
            controls() {
                return this.$store.state.canvas.controls
            },
            themeClasses() {
                const { $vuetify: { theme }, color } = this

                return {
                    [theme.dark ? 'theme--dark' : 'theme--lignt']: true,
                    [color]: true
                }
            },
            color() {
                return this.$store.state.app.color
            },
            list() {
                return [{
                    text: this.controls.guides ? 'Hide guides' : 'Show guides',
                    hotkey: 'Ctrl + Alt + G',
                    alias: 'guides',
                    disabled: !this.guidesList.length
                },{
                    text: 'Clear guides',
                    hotkey: 'Ctrl + Alt + D',
                    alias: 'clear',
                    disabled: !this.guidesList.length
                },{
                    text: 'Open guides',
                    hotkey: 'Ctrl + Alt + O',
                    alias: 'open',
                    disabled: !this.gridList.length
                },{
                    text: 'Save guides',
                    hotkey: 'Ctrl + Alt + M',
                    alias: 'save',
                    disabled: !this.guidesList.length
                },{
                    text: 'Snap to',
                    hotkey: 'Ctrl + Alt + C',
                    alias: 'snap',
                    disabled: false
                },{
                    text: this.grid ? 'Hide grid' : 'Show grid',
                    hotkey: 'Ctrl + Alt + L',
                    alias: 'grid',
                    disabled: false
                }/* ,{
                    text: info ? 'Hide detailed info' : 'Show detailed info',
                    hotkey: 'Ctrl + Alt + I',
                    alias: 'info',
                    disabled: false
                },{
                    text: sdom ? 'Turn off snap DOM' : 'Snap to DOM',
                    hotkey: 'Ctrl + Alt + E',
                    alias: 'sdom',
                    disabled: false
                } */]
            }
        },
        watch: {
            canvas(instance) {
                instance && instance.on('grid:toggle', this.onToggle)
            }
        },
        data: () => ({
            grid: false
        }),
        methods: {
            updateControls(payload)
            {
                this.$store.commit('canvas/set', { controls: { ...this.controls, ...payload } })
            },
            clearGuidesList()
            {
                this.$store.commit('canvas/set', { guidesList: [] })
            },
            handlerReload()
            {
                if (this.canvas) {
                    this.canvas.off('grid:toggle', this.onToggle)
                    this.canvas.on('grid:toggle', this.onToggle)
                }

                this.grid = false
            },
            onToggle()
            {
                this.grid = (this.canvas || {}).showGrid
            },
            choice(action)
            {
                if (action.disabled) return

                const { controls: { guides, open, save, snap, info }, grid } = this

                switch (action.alias) {
                    case 'guides':
                        this.updateControls({ guides: !guides })
                        break
                    case 'open':
                        this.updateControls({ open: !open, save: false, snap: false })
                        break
                    case 'save':
                        this.updateControls({ save: !save, open: false, snap: false })
                        break
                    case 'snap':
                        this.updateControls({ snap: !snap, open: false, save: false })
                        break
                    case 'grid':
                        this.updateControls({ grid: !grid })
                        break
                    case 'info':
                        this.updateControls({ info: !info })
                        break
                    case 'clear':
                        this.clearGuidesList()
                        break
                }
            }
        },
        mounted()
        {
            this.$bus.$on('canvas:reload', () => {
                if (!this.canvas) return

                this.handlerReload()
            })
        }
    }
</script>

<style lang="scss" scoped>
    .rg-menu-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;

        position: absolute;
        left: -39px;
        top: -31px;

        height: 31px;
        width: 39px;

        box-shadow: -2px 0 2px 0px rgba(50,50,50,.3);

        .v-icon.mdi-menu {
            color: rgba(0,0,0,.54);
        }
        &.unselectable {
            user-select: none;
        }
        &.theme--dark {
            box-shadow: -2px 0 2px 0px rgba(0,0,0,.3);
        }
    }
    .rulers-menu {
        .v-list .v-list-item .v-list-item__title {
            display: flex;
            justify-content: space-between;
        }
    }
</style>

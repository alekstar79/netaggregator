<template>
    <v-card class="panel__operations" tile flat>
        <v-card-text class="panel__operations-balance scroller">
            <v-layout class="panel__operations-balance--left" wrap>
                <div class="balance">
                    {{ $t('widget.balance') }}: <span>0</span>
                </div>
            </v-layout>
            <v-layout v-if="balance" class="panel__operations-balance--btn">
                <v-btn :style="{ background: hex }" @click.stop="" text>
                    {{ $t('widget.withdraw') }}
                </v-btn>
            </v-layout>
            <v-layout v-else class="panel__operations-empty">
                {{ $t('widget.donations_not_present') }}
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
    import theme from '~/plugins/theme'

    export default {
        computed: {
            color() {
                return this.$store.state.app.color
            },
            hex() {
                return theme[this.color]
            },
            balance() {
                return false
            }
        }
    }
</script>

<style lang="scss">
    .v-card.panel__operations {
        padding: 15px;

        background: transparent;

        .v-card__text.panel__operations-balance {
            box-sizing: border-box;
            min-height: 250px !important;
            padding: 0;

            .panel__operations-balance--left {
                font-size: 16px;
                font-weight: 400;
                line-height: 30px;
            }
            .panel__operations-balance--right {
                margin-left: 18px;
            }
        }
    }
    .panel__operations-empty,
    .panel__operations-balance--btn, {
        padding: 7px 0;
        justify-content: center;
    }
    .panel__operations-empty {
        word-break: break-word;
        white-space: pre-line;
        text-align: center;
        font-size: 1.2em;
    }
    .balance > span {
        margin-left: 5px;
        font-weight: 500;
        font-size: 18px;

        &::after {
            content: '₽';
            margin-left: 5px;
            font-weight: 300;
        }
    }
</style>

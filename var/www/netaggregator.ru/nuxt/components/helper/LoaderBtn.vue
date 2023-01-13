<template>
    <v-btn @click="$emit('click', $event)"
        :disabled="disabled || progress"
        :loading="progress"
        :class="classes"
        :color="color"
        :text="text"
        :icon="icon"
    >
        <slot />
        <template #loader>
            <span class="loader rotate">
              <v-icon light>mdi-sync</v-icon>
            </span>
        </template>
    </v-btn>
</template>

<script>
    export default {
        props: {
            progress: {
                required: true,
                type: Boolean
            },
            disabled: {
                default: false,
                type: Boolean
            },
            classes: {
                default: 'v-btn--simple',
                type: String
            },
            text: {
                default: false,
                type: Boolean
            },
            icon: {
                default: false,
                type: Boolean
            }
        },
        computed: {
            color() {
                return this.$store.state.app.color
            }
        }
    }
</script>

<style lang="scss" scoped>
    .loader {
        display: flex;

        &.rotate {
            animation: loader 1s infinite;
        }
    }
</style>

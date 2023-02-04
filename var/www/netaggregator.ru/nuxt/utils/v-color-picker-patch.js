import { VColorPicker as VColorPickerOriginal } from 'vuetify/lib'

/**
* Hack to patch VDialog because it has no way to set transition hooks
* @see https://github.com/vuetifyjs/vuetify/issues/6504#issuecomment-594131975
*/
function patchVColorPicker(VColorPicker)
{
    const { methods: { genEdit } } = VColorPicker.prototype.constructor.options

    return VColorPicker.extend({
        methods: {
            genEdit()
            {
                let input, edit = genEdit.call(this)

                setTimeout(() => {
                    if ((input = edit.elm?.querySelector('input'))) {
                        input.addEventListener('focus', () => {
                            this.$bus.$emit('input:focus')
                        })
                        input.addEventListener('blur', () => {
                            this.$bus.$emit('input:blur')
                        })
                    }

                }, 7)

                return edit
            }
        },
        beforeDestroy()
        {
            this.$bus.$emit('input:blur')
        }
    })
}

export const VColorPickerPatched = patchVColorPicker(VColorPickerOriginal)

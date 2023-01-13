import { error, success } from '~/utils/widget'
import { sizes } from '~/assets/data/widget'

const e = new Error('Image type not determine')

export default {
    data: () => ({ sizes }),

    methods: {
        detectType(width, height)
        {
            const match = this.sizes.find(s => width === s.width && height === s.height)

            return match ? match.type : null
        },
        getImagesById(images)
        {
            return this.$store.dispatch('widget/getImagesById', images)
                .then(({ response }) => response || [])
                .catch(this.errorHandler)
        },
        getImages(image_type, offset = 0, count = 10)
        {
            const params = { offset, count, image_type },
                empty = { count: 0, items: [] }

            if (!image_type || !this.$store.state.widget.gtoken) {
                return Promise.resolve(empty)
            }

            return this.$store.dispatch('widget/getImages', params)
                .then(({ response } = empty) => response)
                .catch(this.errorHandler)
        },
        imageLoad(image, image_type)
        {
            const params = { image, image_type },
                resolver = image_type
                    ? this.$store.dispatch('widget/imageLoad', params)
                    : Promise.reject(e)

            resolver.then(({ response }) => {
                if (response && response.type === image_type) {
                    this.$bus.$emit('snack', success(`Загружено ${response.id}`))
                }
            })
                .catch(this.errorHandler)
        },
        uploadFile(file, type = null)
        {
            if (!file || !this.$store.state.widget.gtoken) {
                return this.$bus.$emit('snack', error())
            }
            if (file.type.match('image/.*')) {
                const e = error('Тип не определен'),
                    r = new FileReader(),
                    i = new Image()

                r.onload = ({ target: { result } }) => {
                    i.onload = ({ target: { width, height } }) => {
                        type || (type = this.detectType(width, height))
                        type ? this.imageLoad(file, type) : this.$bus.$emit('snack', e)
                    }

                    i.src = result.toString()
                }

                r.readAsDataURL(file)
            }
        }
    }
}

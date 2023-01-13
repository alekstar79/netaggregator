<template>
    <section class="cta-one">
        <div class="container">
            <!--<img src="/img/starter/shapes/contact-shape-2.png" class="contact-one__shape-2" alt="">-->

            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" class="contact-one__shape-2">
                <defs>
                    <pattern id="hatch-shape-2" width="8" height="8" patternUnits="userSpaceOnUse">
                        <line stroke="#BB92C9" stroke-width="5" x1="0" y1="0" x2="0" y2="10" />
                    </pattern>
                </defs>

                <rect width="60%" height="60%" x="20" y="34" transform="rotate(-45,62,62)" fill="url(#hatch-shape-2)" />
            </svg>

            <div class="cta-one__circle-1" />
            <div class="cta-one__circle-2" />
            <div class="cta-one__circle-3" />

            <div class="cta-one__content text-center">
                <h3>{{ $t('zimed.endless_possibilities') }}</h3>
                <p>{{ $t('zimed.free_trial') }}</p>

                <!--<a @click.prevent="goBack()" class="thm-btn cta-one__btn">
                    {{ $t('zimed.start') }}
                </a>-->
            </div>
        </div>
    </section>
</template>

<!--<script>
    import { goBack } from '~/mixins/common'

    export default {
        mixins: [goBack]
    }
</script>-->

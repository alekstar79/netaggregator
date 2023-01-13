<template>
    <div class="share btn-wrapper">
        <share-network v-for="net in socials" :network="net.id" :title="$t('common.description')" :url="url" :media="media" tag="span" :key="net.id">
            <v-btn :class="`shadowless mr-2 v-btn-${net.id}`" color="#fff" :aria-label="net.id" icon>
                <v-icon>{{ net.icon }}</v-icon>
            </v-btn>
        </share-network>
    </div>
</template>

<script>
    export default {
        components: {
            ShareNetwork: () => import(/* webpackChunkName: "sharing" */ 'vue-social-sharing').then(m => m.ShareNetwork)
        },
        data: () => ({
            url: process.env.ORIGIN_URL,
            media: 'https://netaggregator.ru/icon.png',

            socials: [
                { id: 'vk',       icon: 'mdi-vk'       },
                { id: 'telegram', icon: 'mdi-telegram' },
                { id: 'twitter',  icon: 'mdi-twitter'  }
             // { id: 'facebook', icon: 'mdi-facebook' },
            ]
        })
    }
</script>

<style lang="scss" scoped>
    .share.btn-wrapper {
        display: flex;
        justify-content: center;

        & > a {
            color: transparent;
        }
        .v-btn.shadowless {
            height: 41px;
            width: 41px;
            margin: 5px;

            color: #fff;

            &.v-btn-vk {
                background-color: #4a76a8 !important;
            }
            &.v-btn-telegram {
                background-color: #3b5998 !important;
            }
            &.v-btn-twitter {
                background-color: #55acee !important;
            }
            .v-btn__content .v-icon {
                display: block;
                top: -1px
            }
        }
    }
</style>

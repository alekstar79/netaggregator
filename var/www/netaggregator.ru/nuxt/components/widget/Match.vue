<template>
    <v-layout justify-center>
        <material-card class="module widget-match" :color="color" elevation="2" offset="12" full-width>
            <template #header>
                <v-layout class="widget-header" :justify-space-between="!mobile" :justify-end="mobile" wrap>
                    <lazy-core-hint v-if="!mobile" :hint="{ entity: 'widget', id: 6 }" class="widget-header__title pa-3">
                        {{ $t('widget.match') }}
                    </lazy-core-hint>

                    <div class="widget-header__controls">
                        <lazy-widget-header-tools @toggle="assignEntity" v-on="$listeners" />
                    </div>
                </v-layout>
            </template>

            <lazy-widget-header v-model="value" v-on="$listeners" />

            <v-layout class="module-body" column>
                <div class="module-body__match d-flex">
                    <div class="module-body__match-icon team_a">
                        <div @click="openLoader(value.match.team_a, '50x50')" class="avatar-wrapper">
                            <img :src="value.match.team_a.src" class="module-body__match-icon--img" alt="team_a">
                            <div class="module-body__match-icon--overlay">+</div>
                        </div>
                    </div>

                    <div v-for="(t, i) in ['a','b']" @click="teamDialog(t)" :class="`module-body__match-team_${t}`" :key="`match-${t}-${i}`">
                        <div class="module-body__match--team_name">
                            {{ value.match[`team_${t}`].name || $t(`widget.team_${t}`) }}
                        </div>

                        <div class="module-body__match--descr">
                            {{ value.match[`team_${t}`].descr || $t('widget.description') }}
                        </div>
                    </div>

                    <div @click="infoDialog" class="module-body__match-info">
                        <div class="module-body__match--score">
                            {{ value.match.score.team_a || '0' }}
                            <span>:</span>
                            {{ value.match.score.team_b || '0' }}
                        </div>

                        <div class="module-body__match--state">
                            {{ value.match.state || $t('widget.progress') }}
                        </div>
                    </div>

                    <div class="module-body__match-icon team_b">
                        <div @click="openLoader(value.match.team_b, '50x50')" class="avatar-wrapper">
                            <img :src="value.match.team_b.src" class="module-body__match-icon--img" alt="team_b">
                            <div class="module-body__match-icon--overlay">+</div>
                        </div>
                    </div>
                </div>

                <v-flex class="module-body__events">
                    <v-layout class="module-body__match-team_a--events" column>
                        <v-flex v-for="(t, i) in value.match.events.team_a"
                            :key="`${i}${t.event}${t.minute}`"
                            class="module-body__match-event"
                        >
                            <span class="module-body__match-event--minute">
                                {{ t.minute }}
                            </span>
                            {{ t.event }}
                            <v-btn @click.stop="removeEvent(i, 'team_a')"
                                class="cross-button"
                                :ripple="false"
                                color="#eff0f1"
                                icon
                            >
                                <v-icon color="grey" x-small>
                                    mdi-close
                                </v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>

                    <v-layout class="module-body__match-team_b--events" column>
                        <v-flex v-for="(t, i) in value.match.events.team_b"
                            :key="`${i}${t.event}${t.minute}`"
                            class="module-body__match-event"
                        >
                            <v-btn @click.stop="removeEvent(i, 'team_b')"
                                class="cross-button"
                                :ripple="false"
                                color="#eff0f1"
                                icon
                            >
                                <v-icon color="grey" x-small>
                                    mdi-close
                                </v-icon>
                            </v-btn>
                            <span class="module-body__match-event--minute">
                                {{ t.minute }}
                            </span>
                            {{ t.event }}
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>

            <div @click="openDialog(value, { name: 'more', link: 'more_url', ln: 100, both: true })" class="flat_btn load-more__btn">
                <span class="load-more__btn--label">
                    {{ value.more || $t('widget.footer') }}
                </span>
            </div>

            <lazy-widget-team-dialog v-model="team" :set="set" @update="handler" />
            <lazy-widget-info-dialog v-model="info" :set="set" @update="handler" />
            <lazy-widget-load-dialog v-model="load" :set="set" @update="handler" />
            <lazy-widget-link-dialog v-model="link" :set="set" @update="handler" />
        </material-card>
    </v-layout>
</template>

<script>
    import { extendComputed } from '~/utils/widget'
    import { common, error } from '~/mixins/widget'

    export default {
        mixins: [error, common],

        computed: {
            ...extendComputed('match'),

            mobile() {
                return !!(this.$BROWSER || {}).IS_MOBILE
            },
            teamA() {
                return this.value.match.events.team_a
            },
            teamB() {
                return this.value.match.events.team_b
            },
            color() {
                return this.$store.state.app.color
            }
        },
        watch: {
            teamA: 'scoreTeamA',
            teamB: 'scoreTeamB'
        },
        data: () => ({
            handler: () => {},
            human: 'male',

            team: false,
            info: false,
            load: false,
            link: false,

            set: {}
        }),
        methods: {
            removeEvent(idx, team)
            {
                this.value.match.events[team] = this.value.match.events[team].filter((_,i) => i !== idx)

                this.$emit('update')
            },
            scoreTeamA()
            {
                this.value.match.score.team_a = this.value.match.events.team_a.length
            },
            scoreTeamB()
            {
                this.value.match.score.team_b = this.value.match.events.team_b.length
            },
            infoDialog()
            {
                this.set = { match: this.value.match }

                this.handler = set => {
                    this.info = false

                    set && (this.value.match.events.team_a = set.team_a)
                    set && (this.value.match.events.team_b = set.team_b)
                    set && (this.value.match.state = set.state)

                    this.$emit('update')
                }

                this.info = true
            },
            teamDialog(team)
            {
                const name = this.value.match[`team_${team}`].name,
                    descr = this.value.match[`team_${team}`].descr

                this.set = { name, descr }

                this.handler = set => {
                    this.team = false

                    if (set.close) return

                    set && (this.value.match[`team_${team}`].descr = set.descr)
                    set && (this.value.match[`team_${team}`].name = set.name)
                }

                this.team = true
            },
            openLoader(team, type)
            {
                this.set = { type, widget: 'match' }

                this.handler = set => {
                    this.load = false

                    if (set) {
                        team.src = set.id ? set.images[set.images.length - 1].url : '/img/icons/150x150.png'
                        team.icon_id = set.id
                    }
                }

                this.load = true
            },
            openDialog(value, { name, link, ln = 100, both = false })
            {
                this.set = { name: value[name], link: value[link], ln, both }

                this.handler = set => {
                    this.link = false

                    if (set.close) return

                    value[name] = set.name
                    value[link] = set.link
                }

                this.link = true
            },
            assignEntity(entity)
            {
                this.human = entity
            }
        },
        mounted()
        {
            this.scoreTeamA()
            this.scoreTeamB()

            this.$emit('update')
        }
    }
</script>

<style lang="scss" scoped>
    .widget-match {
        ::v-deep .v-card__text {
            width: unset;

            .module-body {
                padding: 15px 0;

                .module-body__match {
                    .module-body__match-icon {
                        &.team_a {
                            padding-right: 12px;
                            order: 0;
                        }
                        &.team_b {
                            padding-left: 12px;
                            order: 4;
                        }
                        .avatar-wrapper {
                            position: relative;
                            height: 50px;
                            width: 50px;

                            cursor: pointer;

                            img.module-body__match-icon--img {
                                display: block;
                                max-height: 50px;
                                max-width: 50px;
                                height: 100%;
                                width: 100%;

                                background-position: 50%;
                                background-size: cover;
                                border-radius: 5px;
                            }
                            .module-body__match-icon--overlay {
                                position: absolute;
                                left: 0;
                                top: 0;

                                height: 100%;
                                width: 100%;

                                border-radius: 5px;
                                transition: opacity 40ms linear;
                                background-color: #000;
                                color: white;
                                opacity: 0;

                                text-align: center;
                                line-height: 50px;
                                font-size: 2rem;
                            }
                            &:hover .module-body__match-icon--overlay {
                                opacity: .5;
                            }
                        }
                    }
                    .module-body__match-info,
                    .module-body__match-team_a,
                    .module-body__match-team_b {
                        cursor: pointer;

                        .module-body__match--team_name {
                            padding-top: 1px;
                            max-width: 100%;

                            line-height: 17px;
                            font-size: 14px;

                            white-space: nowrap;
                            letter-spacing: -0.15px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }
                        .module-body__match--descr,
                        .module-body__match--state {
                            padding-top: 4px;

                            white-space: nowrap;
                            letter-spacing: -0.13px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            color: #939393;
                        }
                        .module-body__match--score,
                        .module-body__match--state {
                            padding-left: 8px;
                            padding-right: 8px;
                            text-align: center;
                        }
                        .module-body__match--score {
                            position: relative;
                            top: -1px;

                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            line-height: 19px;
                            font-size: 19px;

                            span {
                                padding: 0 2px;
                            }
                        }
                        .module-body__match--state {
                            max-width: 180px;
                            margin: 0 auto;
                        }
                    }
                    .module-body__match-team_a,
                    .module-body__match-team_b {
                        box-sizing: border-box;
                        position: relative;
                        width: 39%;
                    }
                    .module-body__match-team_a {
                        text-align: left;
                        overflow: hidden;
                        flex: 0 1 50%;
                        order: 1;
                    }
                    .module-body__match-team_b {
                        text-align: right;
                        overflow: hidden;
                        flex: 0 1 50%;
                        order: 3;
                    }
                    .module-body__match-info {
                        order: 2;
                    }
                }
                .module-body__events {
                    .module-body__match-team_a--events,
                    .module-body__match-team_b--events {
                        padding-top: 7px;
                        max-width: 39%;

                        white-space: nowrap;

                        .module-body__match-event {
                            padding-top: 10px;

                            letter-spacing: -0.14px;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            color: #939393;

                            .module-body__match-event--minute {
                                padding-right: 4px;
                            }
                            .cross-button {
                                height: 17px;
                                width: 17px;
                                margin: 0;

                                transition: opacity 40ms linear;
                                background-color: #f0f2f5;
                                opacity: 0;
                            }

                            &:hover .cross-button {
                                opacity: 1;
                            }
                        }
                    }
                    .module-body__match-team_a--events {
                        float: left;
                    }
                    .module-body__match-team_b--events {
                        float: right;
                    }
                }
            }
        }
        &.theme--dark {
            .widget-header {
                color: #7a7a7a;

                ::v-deep .header-tools {
                    .v-btn.v-btn--icon {
                        color: #7a7a7a;
                    }
                }
            }
            ::v-deep .v-card__text {
                .module-header .module-header__top-label {
                    color: #7a7a7a;
                }
                .load-more__btn {
                    border-top: 1px solid #424242;
                    background-color: #1e1e1e;
                    color: #7a7a7a;

                    &:hover {
                        background-color: #424242;
                    }
                }
            }
        }
    }
</style>

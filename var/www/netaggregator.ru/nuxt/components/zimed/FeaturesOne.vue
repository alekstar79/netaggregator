<template>
    <div class="cta-three">
        <!--<img src="/img/starter/shapes/cta-1-shape-1.png" class="cta-three__shape-1" alt="">-->
        <!--<img src="/img/starter/shapes/cta-1-shape-2.png" class="cta-three__shape-2" alt="">-->
        <!--<img src="/img/starter/shapes/cta-1-shape-3.png" class="cta-three__shape-3" alt="">-->

        <svg xmlns="http://www.w3.org/2000/svg" width="320" height="294" class="cta-three__shape-1">
            <defs>
                <pattern id="hatch-shape-3" width="6" height="6" patternUnits="userSpaceOnUse">
                    <line stroke="#FC8289" stroke-width="3" x1="0" y1="0" x2="0" y2="6" />
                </pattern>
            </defs>

            <path fill="url(#hatch-shape-3)" stroke="none" transform="rotate(-33,106,78)" d="m5.154637,80.231226c0,0 -9.730671,-25.563857 11.92188,-52.604741c13.942685,-20.1427 32.722293,-27.738811 58.432669,-22.723429c8.667515,1.769177 23.795078,11.621415 30.433682,27.998511c4.203909,17.594423 7.13773,35.967945 18.657884,52.349103c9.897024,13.524488 20.556925,18.921311 32.064919,19.87894c17.598784,0.953569 34.743094,-0.969811 52.751715,-10.144388c20.029426,-14.056065 41.243718,-8.667364 51.128586,-4.057755c19.217863,9.88469 29.476027,29.475535 29.622117,52.345043c2.580785,31.796569 -7.044391,48.952758 -23.941163,63.706758c-19.737249,14.754 -35.043377,14.056062 -53.157498,6.086633c-21.36038,-10.404082 -34.637593,-15.565551 -55.592192,-12.173266c-15.273645,2.174959 -26.927726,12.027184 -32.202897,24.606225c-8.103487,15.829306 -2.467124,27.621159 -16.085211,47.621818c-15.695644,14.721517 -30.157769,16.068696 -50.057322,16.490713c-35.30307,-1.217327 -47.444113,-29.585068 -46.518895,-56.66249c1.339108,-23.323929 15.647003,-41.486458 40.537706,-51.906783c20.820718,-14.453717 13.699162,-39.133014 4.110521,-45.889179c-7.559729,-8.793164 -20.451419,-8.63082 -30.466111,-17.001967c-16.95353,-12.48575 -19.209749,-27.418309 -21.64039,-37.919746z" />
        </svg>

        <div class="container">
            <img src="/img/starter/feature_here_1.png" class="cta-three__moc" alt="entry point">

            <div class="row justify-content-end">
                <div class="col-lg-6">
                    <div class="cta-three__content">
                        <div class="block-title text-left">
                            <span class="block-title__bubbles" />

                            <p>{{ $t('zimed.crucial_aspects') }}</p>
                            <h3>{{ $t('zimed.control_everything') }}</h3>
                        </div>

                        <div class="cta-three__box-wrap">
                            <div class="cta-three__box">
                                <div class="cta-three__box-icon">
                                    <i class="zimed-icon-strategy" />
                                </div>

                                <div class="cta-three__box-content">
                                    <h3>{{ $t('zimed.feature_here_1') }}</h3>

                                    <!--<p>
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor anagi
                                        icdunt ut labore et dolore magna aliqua.
                                    </p>-->
                                </div>
                            </div>

                            <div class="cta-three__box">
                                <div class="cta-three__box-icon">
                                    <i class="zimed-icon-training" />
                                </div>

                                <div class="cta-three__box-content">
                                    <h3>{{ $t('zimed.feature_here_2') }}</h3>

                                    <!--<p>
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor anagi
                                        icdunt ut labore et dolore magna aliqua.
                                    </p>-->
                                </div>
                            </div>
                        </div>

                        <!--<a @click.stop="" class="thm-btn cta-three__btn">
                            {{ $t('zimed.discover_more') }}
                        </a>-->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<!--<script>
    export default {

    }
</script>-->

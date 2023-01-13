import { check, group, sleep } from 'k6'
import { Rate } from 'k6/metrics'

import http from 'k6/http'

/**
* @see https://app.k6.io/projects/3557160
* @see https://github.com/grafana/k6
* @run k6 run ./k6-script.js
*/

// A custom metric to track failure rates
const failureRate = new Rate('check_failure_rate')

export const options = {
    stages: [
        // Linearly ramp up from 1 to 100 VUs during first minute
        { target: 100, duration: '1m' },
        // Hold at 100 VUs for the next 3 minutes and 30 seconds
        { target: 100, duration: '3m' },
        // Linearly ramp down from 50 to 0 VUs over the last 30 seconds
        { target: 0, duration: '30s' }
        // Total execution time will be ~4 minutes
    ],
    thresholds: {
        // We want the 95th percentile of all HTTP request durations to be less than 500ms
        http_req_duration: ['p(95)<500'],
        // Requests with the staticAsset tag should finish even faster
        'http_req_duration{staticAsset:yes}': ['p(99)<250'],
        // Thresholds based on the custom metric we defined and use to track application failures
        check_failure_rate: [
            // Global failure rate should be less than 1%
            'rate<0.01',
            // Abort the test early if it climbs over 5%
            { threshold: 'rate<=0.05', abortOnFail: true }
        ]
    }
}

export default function() {
    const response = http.get('https://netaggregator.ru/designer')

    // check() returns false if any of the specified conditions fail
    const checkRes = check(response, {
        'http2 is used': (r) => r.proto === 'HTTP/2.0',
        'status is 200': (r) => r.status === 200,
        'content is present': (r) => r.body && r.body.includes('image-editor')
    })

    // We reverse the check() result since we want to count the failures
    failureRate.add(!checkRes)

    // Load static assets, all requests
    group('Static Assets', function() {
        // Execute multiple requests in parallel like a browser, to fetch some static resources
        let resps = http.batch([
            ['GET', 'https://netaggregator.ru/app/css/260a30f.css', null, { tags: { staticAsset: 'yes' } }],
            ['GET', 'https://netaggregator.ru/favicon.ico',  null, { tags: { staticAsset: 'yes' } }],
            ['GET', 'https://netaggregator.ru/app/1e43615.modern.js', null, { tags: { staticAsset: 'yes' } }]
        ])
        // Combine check() call with failure tracking
        failureRate.add(!check(resps, {
            'status is 200': (r) => r[0].status === 200 && r[1].status === 200,
            'reused connection': (r) => r[0].timings.connecting === 0
        }))
    })

    sleep(Math.random() * 2 + 1) // Random sleep between 1s and 2s
}

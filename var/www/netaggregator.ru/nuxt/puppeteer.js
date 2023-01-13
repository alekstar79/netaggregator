const puppeteer = require('puppeteer')

const options = {
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
        '--no-sandbox',
        '--single-process',
        '--disable-setuid-sandbox'
    ]
}

;(async function() {
    let browser, page

    try {

        browser = await puppeteer.launch(options)
        page = await browser.newPage()

        await page.setViewport({ width: 1920, height: 1080 })
        await page.goto('https://netaggregator.ru')
        await page.waitForSelector('.cube')

        await page.screenshot({ path: 'screen1.png' })

    } finally {
        browser && await browser.close()
    }

})()

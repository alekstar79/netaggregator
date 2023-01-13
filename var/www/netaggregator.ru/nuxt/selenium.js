const { Builder, By, until } = require('selenium-webdriver')

/**
* @install https://gist.github.com/ziadoz/3e8ab7e944d02fe872c3454d17af31a5
* @install https://tecadmin.net/setup-selenium-chromedriver-on-ubuntu
* @downloads https://chromedriver.chromium.org/downloads
* @see https://habr.com/ru/company/ruvds/blog/338984
* @also https://testcafe.io
*/
;(async function() {
    let driver, bannerOneBtn

    try {

        driver = await new Builder().forBrowser('chrome').build()

        await driver.get('https://netaggregator.ru')

        // bannerOneBtn = await driver.findElement(By.className('thm-btn banner-one__btn'))
        bannerOneBtn = await driver.wait(until.elementLocated(By.className('thm-btn banner-one__btn')), 20000)
        bannerOneBtn = await driver.wait(until.elementIsVisible(bannerOneBtn), 20000)

        await bannerOneBtn.click()

    } catch (e) {
        console.log(e.message)

    } finally {
        driver && await driver.close()
    }

})()

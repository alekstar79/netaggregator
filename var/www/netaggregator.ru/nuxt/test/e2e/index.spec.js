import { Builder, By, until } from 'selenium-webdriver'
import test from 'ava'

/**
* @see https://github.com/avajs/ava/blob/main/docs/recipes/testing-with-selenium-webdriverjs.md
* @see https://github.com/avajs/ava/blob/main/docs/recipes/puppeteer.md
*/

async function driverInit(t, run)
{
  const driver = new Builder().forBrowser('chrome').build()

  try {

    await run(t, driver)

  } finally {
    await driver.close()
  }
}

/* test.beforeEach('init', t => {
  t.context.driver = new Builder().forBrowser('chrome').build()
})

test.afterEach('cleanup', async t => {
  await t.context.driver.close()
}) */

test('Netaggregator Main', driverInit, async (t, driver) => {
  try {

    await driver.get('https://netaggregator.ru')
    await driver.wait(until.titleIs('Главная - Netaggregator'))

    const bannerOneBtn = await driver.findElement(By.className('thm-btn banner-one__btn'))
    // bannerOneBtn = await driver.wait(until.elementLocated(By.className('banner-one__btn')), 20000)
    // bannerOneBtn = await driver.wait(until.elementIsVisible(bannerOneBtn), 20000)
    await bannerOneBtn.click()

    t.true((await driver.findElements(By.className('thm-btn banner-one__btn'))).length > 0)

  } catch (e) {
    t.true(false)
  }
})

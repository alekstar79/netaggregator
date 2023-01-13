#!/usr/bin/env node

// https://stackoverflow.com/questions/59979188/error-failed-to-launch-the-browser-process-puppeteer
// The chromium binary is not available for arm64. If you are on Ubuntu, you can install with:
// sudo apt install chromium or sudo apt install chromium-browser

// https://stackoverflow.com/questions/60205891/import-json-extension-in-es6-node-js-throws-an-error
// Bring in the ability to create the 'require' method - createRequire from 'module'
// construct the require method - createRequire(import.meta.url)
// use the require method - require('path/to/json/file.json')

// import { writeFile } from 'fs/promises'
import { MongoClient, ObjectId } from 'mongodb'
import { createRequire } from 'module'
import puppeteer from 'puppeteer'

const require = createRequire(import.meta.url)
const agents = require('../utils/ua/user-agents.json').map(ua => ua.userAgent)
const uri = 'mongodb://localhost:27017/'
const url = 'https://yandex.ru/pogoda'
const _id = process.argv[2]

const options = {
    args: ['--no-sandbox','--disable-setuid-sandbox'/* ,'--single-process' */],
    ignoreDefaultArgs: ['--disable-extensions'],
    ignoreHTTPSErrors: true,
    defaultViewport: null,
    headless: true
}

Object.defineProperty(Array.prototype, 'uniqByGeo', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function() {
        const a = this.slice()

        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                if (a[i].geoid === a[j].geoid) {
                    a.splice(j--, 1)
                }
            }
        }

        return a
    }
})

function fetchCity(page)
{
    return page.evaluate(() => {
        const card = document.querySelector('.fact.card'),
            basic = card.querySelector('.fact__temp-wrap'),
            props = card.querySelector('.fact__props')

        let temp, icon, cond, wind, humidity, pressure

        temp = basic.querySelector('.fact__basic .temp__value').innerText
        cond = basic.querySelector('div.link__condition').innerText
        icon = basic.querySelector('img.icon').src

        wind = props.querySelector('.fact__wind-speed .term__value').getAttribute('aria-label')
        humidity = props.querySelector('.fact__humidity .term__value').getAttribute('aria-label')
        pressure = props.querySelector('.fact__pressure .term__value').getAttribute('aria-label')

        if (pressure) {
            pressure = pressure.replace(/Миллиметр(ов)? ртутного столба$/, 'мм рт.ст.')
        }
        if (wind) {
            wind = wind.replace(/Метр(ов)? в секунду/, 'м/с')
        }
        if (icon) {
            icon = icon.split(/[/.]/).slice(-2)[0]
        }
        if (temp) {
            temp = `${temp.replace(/([\-+\d]+)/, '$1')} °C`
        }

        return { temp, icon, cond, wind, humidity, pressure }
    })
}

async function fetch(cities, browser)
{
    const page = await browser.newPage(), result = []

    for (const city of cities) { try {
        await page.setUserAgent(agents[Math.floor(Math.random() * agents.length)])
        await page.goto(`${url}/${city.geoid}`, { waitUntil: 'networkidle2' })
        await page.waitForSelector('.fact.card')

        result.push({ city, ...await fetchCity(page) })

    } catch (e) {
    } }

    return result
}

;(async function(client) {
    let browser, db, /* collections, */ dcover, xcover, yandex, cities, diff, codes, old, result = [],
        byWeather = { weather: { $exists: true, $type: 'object' }, connections: { $exists: true, $not: { $size: 0 } } },
        byId = { _id: new ObjectId(_id) }

    async function close()
    {
        browser && await browser.close()
        client && await client.close()
    }

    try {

        await client.connect()

        db = client.db('app')

        dcover = db.collection('dcover')
        xcover = db.collection('xcover')
        yandex = db.collection('yandex')

        // collections = (await db.listCollections().toArray()).map(collection => collection.name)
        cities = (await xcover.find(typeof _id !== 'undefined' ? byId : byWeather).toArray())
            .map(o => o.weather).filter(o => o.geoid).uniqByGeo()

        if (cities.length) {
            browser = await puppeteer.launch(options)
            result = await fetch(cities, browser)
        }
        if (result.length) {
            try {

                old = await yandex.find({}).toArray()
                codes = result.map(o => o.city.geoid)

                diff = old.filter(o => !codes.includes(o.city.geoid))
                result = result.concat(diff)

                // https://stackoverflow.com/a/59161056/6399083
                /* if (collections.includes('yandex')) {
                    await db.dropCollection('yandex')
                } */

            } catch (e) {
                return close()
            }

            await yandex.deleteMany({})

            try {

                await yandex.insertMany(result)

            } catch (e) {
                await yandex.insertMany(old)
            }

            await yandex.createIndex({ 'city.title': 'text' }, { default_language: 'russian' })
            await dcover.updateMany(
                { weather: { $exists: true, $ne: false } },
                { $set: { changed: true } }
            )
        }

        // await writeFile('result.json', JSON.stringify(result, null, 4), { flag: 'w+' })

    } catch (e) {
    }

    await close()

})(new MongoClient(uri))

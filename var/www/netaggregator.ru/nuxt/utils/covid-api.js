const covid_api_base = 'https://api.covid19api.com/'

const fetchRequest = url => fetch(url).then(response => response.json())

const getApiPath = end_point => covid_api_base + end_point

const getDaysRange = days => {
  let d = new Date()

  let from_d = new Date(d.getTime() - (days * 24 * 60 * 60 * 1000))

  let to_date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

  let from_date = `${from_d.getFullYear()}-${from_d.getMonth() + 1}-${from_d.getDate()}`

  return {
    start_date: from_date,
    end_date: to_date
  }
}

const covidApiEndPoints = {
  summary: () => {
    return getApiPath('summary')
  },
  worldAllTimeCases: () => {
    return getApiPath('world')
  },
  countryAllTimeCases: (country, status) => {
    return getApiPath(`dayone/country/${country}/status/${status}`)
  },
  countryDaysCases: (country, status) => {
    let date = getDaysRange(30)

    let end_point = `country/${country}/status/${status}?from=${date.start_date}&to=${date.end_date}`

    return getApiPath(end_point)
  },
  worldDaysCases: () => {
    let date = getDaysRange(30)

    let end_point = `world?from=${date.start_date}&to=${date.end_date}`

    return getApiPath(end_point)
  }
}

export const covidApi = {
  getSummary: () => {
    return fetchRequest(covidApiEndPoints.summary())
  },
  getWorldAllTimeCases: () => {
    return fetchRequest(covidApiEndPoints.worldAllTimeCases())
  },
  getCountryAllTimeCases: (country, status) => {
    return fetchRequest(covidApiEndPoints.countryAllTimeCases(country, status))
  },
  getWorldDaysCases: () => {
    return fetchRequest(covidApiEndPoints.worldDaysCases())
  },
  getCountryDaysCases: (country, status) => {
    return fetchRequest(covidApiEndPoints.countryDaysCases(country, status))
  }
}

const Api = require('./API.js')
const Scraper = require('./Scraper.js')
const Csv = require('./Csv.js')

CATEGORIES = ['greek', 'mediterranean', 'mideastern']
LATITUDE = 41.910377 //LINCOLN PARK
LONGITUDE = -87.653410
RADIUS = 16000

async function main(){
    /*const places = await Api.GetPlaces(CATEGORIES, LATITUDE, LONGITUDE, RADIUS)
    let browser = await Scraper.LaunchBrowser()
    console.log(`${places.length} places found`)
    for (const place of places) {
        console.log(place.name)
        let page = await Scraper.OpenPage(place.alias, browser)
        console.log('Getting url ...')
        place.url = await Scraper.GetURL(page)
        console.log('Getting ammenities ...')
        place.ammenities = await Scraper.GetAmmenities(page)
        //console.log('Getting reviews ...')
        //place.reviews = await Scraper.GetReviews(page)
        await page.close()
    }
    await browser.close()
    Csv.SavePlaces(places)*/

    /*let browser = await Scraper.LaunchBrowser()
    let places = await Csv.LoadCsv('Businesses.csv')
    for (let i = 43; i < places.length; i++){
        let place = places[i]
        console.log(`Scraping ${i} ${place.name}`)
        let page = await Scraper.OpenPage(place.alias, browser)
        let reviews = await Scraper.GetReviews(page)
        Csv.SaveReviews(reviews, place.alias)
        await page.close()
    }
    await browser.close()*/

    let browser = await Scraper.LaunchBrowser()
    let page = await Scraper.OpenPage('olive-mediterranean-grill-chicago-7', browser)
    let reviews = await Scraper.GetReviews(page)
    await page.close()
    await browser.close()
    Csv.SaveReviews(reviews, 'Olive Mediterranean Grill Van Buren')
}

main()
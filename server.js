const Api = require('./API.js')
const Scraper = require('./Scraper.js')
const Csv = require('./Csv.js')

CATEGORIES = ['greek']
LATITUDE = 42.0493507
LONGITUDE = -87.6819763
RADIUS = 40000

async function main(){
    /*const places = await Api.GetPlaces(CATEGORIES, LATITUDE, LONGITUDE, RADIUS)
    let browser = await Scraper.LaunchBrowser()
    for (const place of places) {
        let page = await Scraper.OpenPage(place.alias, browser)
        place.url = await Scraper.GetURL(page)
        place.ammenities = await Scraper.GetAmmenities(page)
        place.reviews = await Scraper.GetReviews(page)
        await page.close()
    }
    await browser.close()
    
    Csv.SavePlaces(places)*/

    let browser = await Scraper.LaunchBrowser()
    let page = await Scraper.OpenPage('olive-mediterranean-grill-evanston', browser)
    let place = {}
    place.reviews = await Scraper.GetReviews(page)
    Csv.SavePlaces([place])
    await page.close()
    await browser.close()
}

main()
const Puppeteer = require('puppeteer')

exports.LaunchBrowser = async function () {
    return await Puppeteer.launch({headless: false, defaultViewport: null})
}

exports.OpenPage = async function (alias, browser) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.goto(`https://www.yelp.com/biz/${alias}`, {timeout : 0, waitUntil : 'networkidle0'})
    return page
}

exports.GetURL = async function(page) {
    try {
        return await page.$eval('[href^="/biz_redir"]', element => element.textContent)
    } catch (err) {}
}

exports.GetAmmenities = async function(page) {
    const [expander] = await page.$x('//a/p[contains(text(), "More Attributes")]')
    if (expander) {
        await expander.click()
        await page.waitForFunction(() =>
            document.evaluate('//a/p[contains(text(), "More Attributes")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue == undefined,
        {timeout: 0})
    }
    
    return await page.evaluate(() => {
        let element = document.evaluate('//h3[text()="Amenities"]//ancestor::section', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
        if (element == undefined) return
        let children = element.childNodes[1].firstChild.firstChild.firstChild.children 
        let amenities = {}
        for (let child of children) {
            const element = child.firstChild.childNodes[1]
            const key = element.firstChild.textContent.toLowerCase().replace(/[- ]/g,'_')
            amenities[key] = element.childNodes[1].textContent.trim()
        }
        return amenities
    })
}

exports.GetReviews = async function (page) {
    let reviews = []
    let nextPossible = true
    while (nextPossible) {
        await sleep((Math.random() * 1000) + 1000)

        let scrapedReviews = await page.evaluate(() => {
            let element = document.evaluate('//*[self::h3 or self::h4][text()="Recommended Reviews"]//ancestor::section[1]//div/ul', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
            let posts = []

            let postIndex = 0
            for (let child of element.childNodes) {
                console.log(`       Scraping post ${postIndex}`)
                postIndex++

                let reviewElement = child.firstElementChild.childNodes[1]

                let place_photos = reviewElement.querySelector('[class*="camera"]')
                if (place_photos) {
                    place_photos = place_photos.parentElement.textContent.trim().split(' ')
                    if (place_photos.length > 1) place_photos = parseInt(place_photos[0])
                    else place_photos = 0
                } else place_photos = 0
                let check_in = reviewElement.querySelector('[class*="check-in"]')
                if (check_in) {
                    check_in = check_in.parentElement.textContent.trim().split(' ')
                    if (check_in.length > 1) check_in = check_in[0]
                    else check_in = "1"
                } else check_in = "0"

                let expanders = reviewElement.querySelectorAll('[role="button"]')
                for (expander of expanders) expander.click()
                let ratingElements = reviewElement.querySelectorAll('[aria-label$="star rating"]')
                let textElements = reviewElement.querySelectorAll('div [lang="en"]')
                let reactionElements = {}
                reactionElements.useful = reviewElement.querySelectorAll('[class*="useful"]')
                reactionElements.funny = reviewElement.querySelectorAll('[class*="funny"]')
                reactionElements.cool = reviewElement.querySelectorAll('[class*="cool"]')

                let reviews = []
                for (let i = 0; i < reactionElements.cool.length; i++) {
                    let reactions = {}
                    for (reactionType in reactionElements) {
                        let reaction = reactionElements[reactionType][i].parentElement.textContent.split(' ')
                        if (reaction.length > 1) reaction = reaction[1] 
                        else reaction = "0"
                        reactions[reactionType] = reaction
                    }
                    let photos = textElements[i].parentElement.parentElement.nextElementSibling.querySelectorAll('[class*="photo-box-img"]').length
                    reviews.push({
                        rating : ratingElements[i].getAttribute('aria-label').charAt(0),
                        date : ratingElements[i].parentElement.parentElement.nextElementSibling.firstElementChild.textContent,
                        photos : photos,
                        ROTD : reviewElement.querySelector('[href^="/browse/reviews/picks"]') != undefined, //Check
                        text : textElements[i].textContent,
                        reactions : reactions
                    })
                }
                if (place_photos == 0) for (review of reviews) place_photos += review.photos

                let userElement = child.firstElementChild.childNodes[0]

                let elite_2020 = userElement.querySelector('[href="/elite"]') != undefined

                let name = userElement.querySelector('.user-passport-info a')
                if (name) name = name.textContent

                let id = userElement.querySelector('[href^="/user_details?userid="]')
                if (id) id = id.getAttribute('href').split('=')[1]

                let location = userElement.querySelector('.user-passport-info > div')
                if (location) location = location.textContent

                let userFriends = userElement.querySelector('[class*="friend"]')
                if (userFriends) userFriends = userFriends.parentElement.textContent.split(' ')[0]
                else userFriends = "0"

                let userReviews = userElement.querySelector('[class*="review"]')
                if (userReviews) userReviews = userReviews.parentElement.textContent.split(' ')[0]

                let userPhotos = userElement.querySelector('[class*="camera"]')
                if (userPhotos) userPhotos = userPhotos.parentElement.textContent.split(' ')[0]
                else userPhotos = "0"

                let user = {
                    id : id,
                    name : name,
                    elite_2020 : elite_2020,
                    location : location,
                    friends : userFriends,
                    reviews : userReviews,
                    total_photos : userPhotos
                }

                posts.push({
                    user : user,
                    check_in : check_in,
                    place_photos : place_photos,
                    reviews : reviews
                })
            }
            return posts
        })
        reviews = reviews.concat(scrapedReviews)

        let pagination = await page.$eval('[aria-label="Pagination navigation"] > div', element => element.textContent)
        nextPossible = await page.evaluate(() => {
            let element = document.evaluate('//span[text()="Next"]//ancestor::a', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
            if (element) {
                element.click()
                return true
            }
            return false
        })
        if (nextPossible) {
            await page.waitForFunction(
                (pagination) => document.querySelector('[aria-label="Pagination navigation"] > div').textContent != pagination,
                {timeout: 0}, pagination
            )
        }
    }
    return reviews
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
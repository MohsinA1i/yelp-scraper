const fs = require('fs') 
const https = require('https')
 
exports.GetPlaces = async function (categories, latitude, longitude, radius) {
    let categoryString = ''
    for (let i = 0; i < categories.length; i++) {
        categoryString += categories[i]
        if (i < categories.length - 1) categoryString += ','
    }
    let query = fs.readFileSync('search.query', 'utf8').replace('CATEGORY', categoryString).replace('LATITUDE', latitude).replace('LONGITUDE', longitude).replace('RADIUS', radius)
    let businesses = []
    let remaining
    let offset = 0
    while (remaining > 0 || remaining == undefined) {
        let response = await QueryAPI(query.replace('OFFSET', offset))
        response = response.data.search
        offset += 50
        remaining = response.total - offset
        response = response.business
        businesses = businesses.concat(response)
    }
    return businesses
}

exports.GetPlace = async function (alias) {
    let query = fs.readFileSync('business.query', 'utf8').replace('ALIAS', alias)
    return await QueryAPI(query)
}

async function QueryAPI(query) {
    return await HttpsPost({
        hostname: 'api.yelp.com',
        path: '/v3/graphql',
        headers: {
            'Authorization': 'Bearer 7VD_AGUnarRmaKfV9NutfGzSZ3k9k8ysy08eSALlnrLsKyb524M3o8-9qdhdzqNai_MbclTgmS0HrhbJ6phuej-kBEHPIP9fIcfwY5B7foMN6aHDrnt0ysKXXyYYXnYx',
            'Content-Type': 'application/graphql'
        },
        data: query
    })
}

function HttpsPost({data, ...parameters}) {
    const options = {
        method: 'POST',
        ...parameters
    }
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            const chunks = []
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                let body = Buffer.concat(chunks)
                switch(res.headers['content-type']) {
                    case 'application/json':
                        body = JSON.parse(body)
                        break
                }
                resolve(body)
            })
        })
        req.on('error', reject)
        if(data) req.write(data)
        req.end()
    })
}
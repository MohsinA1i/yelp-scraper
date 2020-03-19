const { Parser } = require('json2csv')
const fs = require('fs')

exports.SavePlaces = function (places) {
    let dataFrame = []

    for (place of places) {
        if (place.price) place.price = place.price.length

        if (place.location) {
            place.address = place.location.formatted_address
            delete place.location
        }

        if (place.coordinates) {
            place.latitude = place.coordinates.latitude
            place.longitude = place.coordinates.longitude
            delete place.coordinates
        }

        if (place.categories) {
            for (let i = 0; i < place.categories.length; i++)
                place[`category_${i}`] =  place.categories[i].alias
            delete place.categories
        }

        if (place.hours && place.hours.length > 0) {
            let days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            for (const openHours of place.hours[0].open) {
                place[`${days[openHours.day]}_open`] = openHours.start
                place[`${days[openHours.day]}_close`] = openHours.end
            }
            delete place.hours
        }

        if (place.ammenities) {
            Object.assign(place, place.ammenities)
            delete place.ammenities
        }

        if (place.reviews) exports.SaveReviews(place.reviews)
        
        dataFrame.push(place)
    }

    const parser = new Parser()
    const csv = parser.parse(dataFrame)
    fs.writeFile('Businesses.csv', csv, function (err) {if (err) throw err})
}

exports.SaveReviews = function (reviews, name) {
    let dataFrame = []

    for (post of reviews) {
        for (review of post.reviews) {
            Object.assign(review, review.reactions)
            delete review.reactions
            Object.assign(review, post.user)
            review.check_in = post.check_in
            review.place_photos = post.place_photos
            dataFrame.push(review)
        }
    }

    const parser = new Parser()
    const csv = parser.parse(dataFrame)
    fs.writeFile(`${name} Reviews.csv`, csv, function (err) {if (err) throw err})
}
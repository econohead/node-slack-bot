var request = require('request')

module.exports = function (token) {
	return new Untappd (token)
}

function Untappd (token) {
	var self = this
	self.token = token
	self.get = function (beer, fn) {
		var url = 'https://api.untappd.com/v4/search/beer?q=' + beer + 
		'&access_token=' + self.token
	request({url: url, json: true}, function (error, response, data) {
		if (error) {
			return fn(error)
		}
		if (response.statusCode !== 200) {
			return fn(new Error('unexpected status ' + response.statusCode))
		}

/*		for (var i = 0; numBeers = data.response.beers.length; i < numBeers, i++)
		{
  			if (data.response.beers.items.beer[i].beer_name == beer)
  			{
  				return data.response.beers.items.beer.beer_name[i];
  				//var beerName = data.response.beers.items.beer.beer_name[i]
  				console.log(beerName[i]);
  			}
  		}
*/

		var beerLabel = data.response.beers.items[0].beer.beer_label
		var beerName = data.response.beers.items[0].beer.beer_name
		var breweryName = data.response.beers.items[0].brewery.brewery_name
		var breweryURL = data.response.beers.items[0].brewery.contact.url
		var beerDescription = data.response.beers.items[0].beer.beer_description

// console.log url variable to see if it's using the %AND join for items with two or more names.

		var msg = {
    	"attachments": [
    	{
    		"fallback": beerName,
            "color": "#6699ff",
            //"pretext": url,
            "title": beerName,
            //"title_link": "https://api.slack.com/",
            "text": beerDescription,
            "fields": [
                {
                    "value": "<" + breweryURL + "|" + breweryName + ">",
                    "short": false
                }
            ],
            "thumb_url": beerLabel
        }
    ]
}

		fn(null, msg)
	})
	}
}

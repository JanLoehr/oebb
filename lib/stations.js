'use strict'

const { createGet, auth } = require('./helpers')
const merge = require('lodash/merge')
const take = require('lodash/take')
const isString = require('lodash/isString')

const got = require('got')
const { stringify } = require('query-string')

const defaults = {
	results: 10, // option seems to be ignored server-side
}

const createStation = (s) => ({
	type: 'station',
	id: String(s.number),
	name: s.name || s.meta, // @todo
	meta: Boolean(s.meta), // @todo
	location: {
		type: 'location',
		longitude: s.longitude / Math.pow(10, 6),
		latitude: s.latitude / Math.pow(10, 6),
	},
})

const search = async (query, opt = {}) => {
	if (!query || !isString(query)) {
		throw new Error('missing or invalid `query` parameter')
	}
	// eslint-disable-next-line no-unused-vars
	const options = merge(defaults, opt)

	const { body } = await got.get("https://pv-apps.web.oebb.at/stations", {
		searchParams: stringify({name: query}, { arrayFormat: 'bracket' }),
		responseType: 'json',
	})

	const rawStations = body;

	const stations = rawStations.map(createStation)
	return options.results ? take(stations, options.results) : stations
}
search.features = { results: 'Max. number of results returned' } // required by fpti

module.exports = { search }

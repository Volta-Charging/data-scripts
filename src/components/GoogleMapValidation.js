import React, { Component } from 'react';
import axios from 'axios';
import { Dimmer, Loader, Progress } from 'semantic-ui-react';

import { ScriptLoader } from './ScriptLoader';

const GOOGLE_MAPS_ENDPOINT = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}&libraries=places`

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export class GoogleMapValidation extends Component {
  sites = []

  state = {
    currentIndex: 0,
    records: [],
  }

  loadGoogleMaps = async () => {
    const places = window.google.maps.places

    const json = await axios.get('https://api.voltaapi.com/v1/public-sites')
    this.sites = json.data
  
    const service = new places.PlacesService(document.createElement('div'));

    this.asyncForEach(this.sites, async (site) => {
      await sleep(5000)

      const record = {}

      const expectedAddress = `${site.street_address},${site.city},${site.state} ${site.zip_code}`
      record.expectedAddress = expectedAddress.split(',').join(' ')
      record.expectedCoordinates = site.location.coordinates
      record.siteId = site.id
      record.siteName = site.name.split(',').join(' ')
      
      const request = {
        query: expectedAddress,
        fields: ['name', 'geometry'],
      };

      service.textSearch(request, async (data, status) => {
        if (status !== places.PlacesServiceStatus.OK) console.error('dev::error', status)

        if (!data || data.length === 0 || !data[0].geometry || !data[0].geometry.location) {
          record.actualCoordinates = [NaN, NaN]
          record.actualAddress = ''
        } else {
          record.numberOfResult = data.length

          const { lng, lat } = data[0].geometry.location
          record.actualCoordinates = [lng(), lat()]

          record.actualAddress = data[0]['formatted_address'].split(', ').join(' ').replace(' USA', '')
        }

        this.setState(({ currentIndex, records }) => ({
          currentIndex: currentIndex + 1,
          records: [...records, record]
        }))
      })
    })
  }

  asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  getRow = (record) => {
    const {
      actualAddress, actualCoordinates, expectedAddress, expectedCoordinates, numberOfResult, siteId, siteName,
    } = record

    const miles = Math.hypot(Math.abs(actualCoordinates[0] - expectedCoordinates[0]), Math.abs(actualCoordinates[1] - expectedCoordinates[1]))
    return (
      <div key={siteId}>
        {`${siteId},${expectedCoordinates[0]},${expectedCoordinates[1]},${expectedAddress},${actualCoordinates[0]},${actualCoordinates[1]},${actualAddress},${numberOfResult},${siteName},${miles}`}
      </div>
    )
  }

  handleScriptInject({ scriptTags }) {
    if (scriptTags) {
        const scriptTag = scriptTags[0];
        scriptTag.onload = this.loadGoogleMaps;
    }
  }

  renderContent = () => {
    const { currentIndex, records } = this.state;

    const count = this.sites.length

    // Loading sites...
    if (count === 0) {
      return (
        <Dimmer active inverted>
          <Loader content="Loading sites..." />
        </Dimmer>
      )
    }

    // Finished fetching all Google Maps records...
    if (currentIndex >= count) {
      return (
        <>
          <div>site id, expected lon,expected lat,expected address,actual lon,actual lat,actual address,number of results,name,distance</div>
          {records.map(record => this.getRow(record))}
        </>
      )

    // Fetching Google Maps records...
    } else {
      return (
        <Dimmer active inverted>
          <Loader content={`Fetching record #${currentIndex + 1} of ${count}...`} />
        </Dimmer>
      )

    }
  }

  render() {
    return (
      <ScriptLoader
        onScriptLoaded={this.loadGoogleMaps}
        script={GOOGLE_MAPS_ENDPOINT}
      >
        {this.renderContent()}
      </ScriptLoader>
    );
  }
}

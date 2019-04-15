import React, { Component } from 'react';
import axios from 'axios';
import { Dimmer, Loader } from 'semantic-ui-react';

import { ScriptLoader } from './ScriptLoader';

export class AppleMapValidation extends Component {
  sites = []
  
  state = {
    currentIndex: 0,
    records: [],
  };

  loadAppleMaps = async () => {
    const mapkit = window.mapkit

    mapkit.init({
      authorizationCallback: done => done(process.env.REACT_APP_MAPKIT_JS_API_KEY),
    });

    const json = await axios.get('https://api.voltaapi.com/v1/public-sites');
    this.sites = json.data;

    const searchSession = new mapkit.Search();

    this.sites.forEach(site => {
      const record = {};

      const expectedAddress = `${site.street_address},${site.city},${
        site.state
      } ${site.zip_code}`;
      record.expectedAddress = expectedAddress.split(',').join(' ');
      record.expectedCoordinates = site.location.coordinates;
      record.siteId = site.id;
      record.siteName = site.name.split(',').join(' ');

      searchSession.search(expectedAddress, (error, data) => {
        if (error) return console.error('dev::error', error);

        if (
          !data ||
          data.length === 0 ||
          !data.places[0] ||
          !data.places[0].coordinate
        ) {
          record.actualCoordinates = [NaN, NaN];
          record.actualAddress = '';
        } else {
          record.numberOfResult = data.places.length;

          const { longitude, latitude } = data.places[0].coordinate;
          record.actualCoordinates = [longitude, latitude];

          record.actualAddress = data.places[0].formattedAddress
            .split(', ')
            .join(' ')
            .replace(' United States', '');
        }

        this.setState(({ currentIndex, records }) => ({
          currentIndex: currentIndex + 1,
          records: [...records, record],
        }));
      });
    });
  }

  getRow = record => {
    const {
      actualAddress,
      actualCoordinates,
      expectedAddress,
      expectedCoordinates,
      numberOfResult,
      siteId,
      siteName,
    } = record;
    const miles = Math.hypot(
      Math.abs(actualCoordinates[0] - expectedCoordinates[0]),
      Math.abs(actualCoordinates[1] - expectedCoordinates[1])
    );
    return (
      <div key={siteId}>{`${siteId},${expectedCoordinates[0]},${
        expectedCoordinates[1]
      },${expectedAddress},${actualCoordinates[0]},${
        actualCoordinates[1]
      },${actualAddress},${numberOfResult},${siteName},${miles}`}</div>
    );
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

    // Finished fetching all Apple Maps records...
    if (currentIndex >= count) {
      return (
        <>
          <div>site id, expected lon,expected lat,expected address,actual lon,actual lat,actual address,number of results,name,distance</div>
          {records.map(record => this.getRow(record))}
        </>
      )

    // Fetching Apple Maps records...
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
        onScriptLoaded={this.loadAppleMaps}
        script="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"
      >
        {this.renderContent()}
      </ScriptLoader>
    );
  }
}

import React from 'react';
import { Route } from "react-router-dom";

import { AppleMapValidation } from '../components/AppleMapValidation';
import { GoogleMapValidation } from '../components/GoogleMapValidation';
import { Home } from '../components/Home';

export const MainNavigation = () => (
  <>
    <Route
      path="/apple-maps-validation"
      component={AppleMapValidation}
    />

    <Route
      path="/google-maps-validation"
      component={GoogleMapValidation}
    />

    <Route
      exact
      path="/"
      component={Home}
    />
  </>
);

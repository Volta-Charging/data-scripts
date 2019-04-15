import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import 'semantic-ui-css/semantic.min.css'

import { MainNavigation } from './navigation/MainNavigation';

export default () => (
  <Router>
    <MainNavigation />
  </Router>
);

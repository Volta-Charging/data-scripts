import React from 'react';
import { Link } from "react-router-dom";
import { Container, Dropdown, Header, Icon, Menu } from 'semantic-ui-react';

export const Home = () => (
  <Container>
    <Menu>
      <Dropdown text='Map Validation' pointing className='link item'>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/apple-maps-validation">
            Apple Maps
          </Dropdown.Item>

          <Dropdown.Item as={Link} to="/google-maps-validation">
            Google Maps
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Menu.Menu position="right">
        <a href="https://github.com/Volta-Charging/data-scripts">
          <Menu.Item>
            <Icon name="github" />
          </Menu.Item>
        </a>
      </Menu.Menu>
    </Menu>

    <Header as='h1'>Data Scripts</Header>
  </Container>
);

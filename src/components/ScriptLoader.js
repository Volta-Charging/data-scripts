import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'semantic-ui-react';
import PropTypes from 'prop-types';

export class ScriptLoader extends React.Component {
  handleScriptInject({ scriptTags }) {
    if (scriptTags) {
      const { onScriptLoaded } = this.props;

      const scriptTag = scriptTags[0];
      scriptTag.onload = onScriptLoaded;
    }
  }

  render() {
    const { children, script, ...restProps } = this.props;

    return (
      <Container>
        <Helmet
          {...restProps}
          script={[{ src: script }]}
          onChangeClientState={(_, addedTags) => this.handleScriptInject(addedTags)}
        />
        {children}
      </Container>
    )
  }
}

ScriptLoader.propTypes = {
  onScriptLoaded: PropTypes.func.isRequired,
  script: PropTypes.string.isRequired,
};

import * as React from 'react';
import renderer, { ReactTestRenderer } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  const tree: ReactTestRenderer = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  expect(tree.toJSON()).toMatchSnapshot();
});

import { mount } from 'enzyme';
import React from 'react';
import UserGuide from '../../../src/components/user-guide/user-guide';

const wrapper = mount(<UserGuide />);

describe('When UserGuide mounts', () => {
    it('should render the Gaffer Documentation button with correct href link attached', () => {
        const button = wrapper.find('a#gaffer-documentation-button');

        expect(button.text()).toBe('Gaffer Documentation');
        expect(button.props().href).toBe('https://gchq.github.io/gaffer-doc/summaries/getting-started.html');
    });
    it('should display example Elements Schema correctly', () => {
        expect(wrapper.find('div#example-elements-schema').text()).toContain('{"edges":{"RoadUse":{');
    });
    it('should display example Types Schema correctly', () => {
        expect(wrapper.find('div#example-types-schema').text()).toContain('{"types":{"junction":{');
    });
});

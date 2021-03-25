import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import SimpleAddGraph from '../../../src/components/add-graph/SimpleAddGraph';
import { CreateSimpleGraphRepo } from '../../../src/rest/repositories/create-simple-graph-repo';

jest.mock('../../../src/rest/repositories/create-simple-graph-repo');
let wrapper: ReactWrapper;

beforeEach(() => (wrapper = mount(<SimpleAddGraph />)));
afterEach(() => wrapper.unmount());

describe('SimpleAddGraph UI component', () => {
    describe('Layout', () => {
        it('Should have a Graph Id text field', () => {
            const textfield = wrapper.find('input');
            expect(textfield.at(0).props().name).toBe('graph-id');
        });
        it('Should have a graph description text field', () => {
            const textfield = wrapper.find('textarea#graph-description');
            expect(textfield.props().name).toBe('graph-description');
        });
        it('Should have a store type select with the correct label', () => {
            const select = wrapper.find('div#storetype-select-grid');
            expect(select.text()).toBe('Store TypeMap StoreStore TypeSet to Map Store by default');
        });
        it('should have a Submit button', () => {
            const submitButton = wrapper.find('button').text();
            expect(submitButton).toBe('Add Graph');
        });
        it('Should allow storetype to be selected', ()=> {
            selectStoreType('ACCUMULO');
            const selectText = wrapper.find('div#storetype-select-grid').find('div#storetype-select');
            expect(selectText.text()).toBe('Accumulo');
            selectStoreType('MAPSTORE');
            expect(selectText.text()).toBe('Map Store');
        })
        it('Should allow federated store to be selected', ()=> {
            selectStoreType('FEDERATED_STORE');
            const selectText = wrapper.find('div#storetype-select-grid').find('div#storetype-select');
            expect(selectText.text()).toBe('Federated Store');
        })
    });
    describe('Add Graph Button', () => {
        it('should be disabled when Graph Name and Graph Description fields are empty', () => {
            expect(wrapper.find('button#add-new-graph-button').props().disabled).toBe(true);
        });
        it('should be disabled when Graph Name field is empty', () => {
            inputdescription('test');
            expect(wrapper.find('button#add-new-graph-button').props().disabled).toBe(true);
        });
        it('should be disabled when Graph Description field is empty', () => {
            inputgraphId('test');
            expect(wrapper.find('button#add-new-graph-button').props().disabled).toBe(true);
        });
        it('Should be enabled when Graph Name and Graph Description is not empty', () => {
            inputgraphId('test');
            inputdescription('test');
            selectStoreType('MAPSTORE');
            expect(wrapper.find('button#add-new-graph-button').props().disabled).toBe(false);
        });
    });
    describe('On Submit Request', () => {
        it('should display success message in the NotificationAlert', async () => {
            mockAddGraphRepoWithFunction(() => {});
            inputgraphId('OK Graph');
            inputdescription('test');

            clickSubmit();
            //@ts-ignore
            await wrapper.update();
            await wrapper.update();

            expect(wrapper.find('div#notification-alert').text()).toBe('OK Graph was successfully added');
        });
    });
    function clickSubmit(): void {
        wrapper.find('button#add-new-graph-button').simulate('click');
    }
    function inputgraphId(graphId: string): void {
        wrapper.find('input#graph-id').simulate('change', {
            target: { value: graphId },
        });
    }
    function selectStoreType(storeType: string) {
        wrapper.find('div#storetype-formcontrol').find('input').simulate('change',{
            target: {value:storeType}
        })
    }
    function inputdescription(description: string): void {
        wrapper.find('textarea#graph-description').simulate('change', {
            target: { value: description },
        });
        expect(wrapper.find('textarea#graph-description').props().value).toBe(description);
    }
    function mockAddGraphRepoWithFunction(f: () => void): void {
        // @ts-ignore
        CreateSimpleGraphRepo.mockImplementationOnce(() => {
            return {
                create: f,
            };
        });
    }
});

import {mount, ReactWrapper} from "enzyme";
import React from "react";
import StoreTypeSelect from "../../../src/components/create-graph/storetype";
import {StoreType} from "../../../src/domain/store-type";

let component: ReactWrapper;
const onChangeMockCallBack = jest.fn();
beforeEach(() =>{
     component = mount(
        <StoreTypeSelect value={StoreType.MAPSTORE} onChange={onChangeMockCallBack} />
    );
})
afterEach(() => {
    component.unmount()
    jest.resetAllMocks();
})

describe("Storetype select component", () => {
    it("Should have the correct value in the value props", () => {
        expect(component.find("div#storetype-formcontrol")
            .find("input").props().value).toBe(StoreType.MAPSTORE);
    })
    it("Should allow federated storetype to be selected", () => {
        selectStoreType(StoreType.FEDERATED_STORE);

        expect(onChangeMockCallBack).toHaveBeenCalledWith(StoreType.FEDERATED_STORE);
    });
    it("Should allow accumulo storetype to be selected", () => {
        selectStoreType(StoreType.ACCUMULO);

        expect(onChangeMockCallBack).toHaveBeenCalledWith(StoreType.ACCUMULO);
    });
    it("Should allow mapstore storetype to be selected", () => {
        selectStoreType(StoreType.MAPSTORE);

        expect(onChangeMockCallBack).toHaveBeenCalledWith(StoreType.MAPSTORE);
    });

})
function selectStoreType(storeType: StoreType) {
    component
        .find("div#storetype-formcontrol")
        .find("input")
        .simulate("change", {
            target: { value: storeType },
        });
}
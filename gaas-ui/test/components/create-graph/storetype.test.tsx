import {mount, ReactWrapper} from "enzyme";
import React from "react";
import StoreTypeSelect from "../../../src/components/create-graph/storetype";
import {GetStoreTypesRepo} from "../../../src/rest/repositories/get-store-types-repo";
import {act} from "react-dom/test-utils";
import {RestApiError} from "../../../src/rest/RestApiError";
import {IStoreTypesResponse} from "../../../src/rest/http-message-interfaces/response-interfaces";

jest.mock("../../../src/rest/repositories/get-store-types-repo");
let component: ReactWrapper;
const onChangeMockCallBack = jest.fn();
afterEach(() => {
    component.unmount();
    jest.resetAllMocks();
});

describe("Storetype select component", () => {
    describe("General", () => {
        beforeEach(() => {
            component = mount(
                <StoreTypeSelect value={""} allStoreTypes={[
                    "accumulo",
                    "mapStore",
                    "proxy",
                    "proxyNoContextRoot", "federated"
                ]} onChangeStoreType={onChangeMockCallBack}/>
            );
        });
        it("Should have the correct value in the value props", () => {
            expect(component.find("div#storetype-formcontrol")
                .find("input").props().value).toBe("");
        });
        it("should allow a storetype to be selected", () => {
            selectStoreType("accumulo");
            expect(onChangeMockCallBack).toHaveBeenCalledWith("accumulo");

        });
        it("Should not display helper text when storetype is not empty", () => {
            expect(component.find("p#storetype-form-helper").text()).toBe("");

        });


    });
    describe("Helper Text", () => {
        beforeEach(() => {
            component = mount(
                <StoreTypeSelect value={""} allStoreTypes={[]} onChangeStoreType={onChangeMockCallBack}/>
            );
        });
        it("Should display helper text when storetype empty", () => {
            expect(component.find("p#storetype-form-helper").text()).toBe("No storetypes available");

        });
    });
});

function selectStoreType(storeType: string) {
    component
        .find("div#storetype-formcontrol")
        .find("input")
        .simulate("change", {
            target: {value: storeType},
        });
}

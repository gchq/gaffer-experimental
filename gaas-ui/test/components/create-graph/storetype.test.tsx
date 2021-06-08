import {mount, ReactWrapper} from "enzyme";
import React from "react";
import StoreTypeSelect from "../../../src/components/create-graph/storetype";
import {GetStoreTypesRepo} from "../../../src/rest/repositories/get-store-types-repo";
import {act} from "react-dom/test-utils";
import {RestApiError} from "../../../src/rest/RestApiError";
import {IAllStoreTypesResponse} from "../../../src/rest/http-message-interfaces/response-interfaces";

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
            mockGetStoretypesRepoToReturn({
                storeTypes: [],
                federatedStoreTypes: []
            });
            component = mount(
                <StoreTypeSelect value={""} onChange={onChangeMockCallBack}/>
            );
        });
        it("Should have the correct value in the value props", () => {
            expect(component.find("div#storetype-formcontrol")
                .find("input").props().value).toBe("");
        });
        it("Should display helper message when storetype empty", () => {
            waitForComponentToRender(component);
            expect(component.find("p#storetype-form-helper").text()).toBe("No storetypes available");

        });
    });
    describe("Integration with GetStoretypesRepo", () => {
        beforeEach(() => {
            mockGetStoretypesRepoToReturn({
                storeTypes: [
                    "accumulo",
                    "mapStore",
                    "proxy",
                    "proxyNoContextRoot"
                ],
                federatedStoreTypes: [
                    "federated"
                ]
            });
            waitForComponentToRender(component);
            component = mount(
                <StoreTypeSelect value={""} onChange={onChangeMockCallBack}/>
            );
        });
        it("should allow a storetype to be selected", () => {
            selectStoreType("accumulo");
            expect(onChangeMockCallBack).toHaveBeenCalledWith("accumulo");

        });
    });
    describe("GetStoretypeRepo error", () => {
        beforeEach(() => {
            mockGetStoretypesRepoToThrow();
            waitForComponentToRender(component);
            component = mount(
                <StoreTypeSelect value={""} onChange={onChangeMockCallBack}/>
            );
        });
        it("should show an error when GetStoretypesRepo throws an error", () => {
            waitForComponentToRender(component);
            expect(component.find("p#storetype-form-helper").text()).toBe("Storetypes unavailable: undefined");

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

function mockGetStoretypesRepoToReturn(storetypes: IAllStoreTypesResponse): void {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementationOnce(() => ({
        get: () =>
            new Promise((resolve, reject) => {
                resolve(storetypes);
            }),
    }));
}

function mockGetStoretypesRepoToThrow(): void {
    // @ts-ignore
    GetStoreTypesRepo.mockImplementationOnce(() => ({
        get: () => {
            throw new RestApiError("Server Error", "Storetypes unavailable");
        }

    }));
}

// @ts-ignore
async function waitForComponentToRender(wrapper: ReactWrapper) {
    // React forces test to use act(() => {}) when the component state is updated in some cases
    await act(async() => {
        await new Promise((resolve) => setTimeout(resolve));
        wrapper.update();
        wrapper.update();
    });
}

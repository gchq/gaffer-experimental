import {mount, ReactWrapper} from "enzyme";
import React from "react";
import GraphsTable from "../../../src/components/add-graph/graphs-table";
import {Graph} from "../../../src/domain/graph";

let hide = false;
let component: ReactWrapper;
const onChangeProxyURLMockCallback = jest.fn();
const OnClickAddProxyMockCallback = jest.fn();
const graphs = [new Graph("testGraph","Graph Description","test.url","UP")]
beforeEach(() => {
    component = mount(
        <GraphsTable hide ={hide}
                     onChangeProxyURL={onChangeProxyURLMockCallback}
                     proxyURL={"test.url"}
                     onClickAddProxyURL={OnClickAddProxyMockCallback}
                     graphs={graphs}
        />
    )
})
afterEach(() => {
    component.unmount();
    hide = false;
})

describe("Hide GraphsTable", () => {
    hide = true;
    it("Should not be visible when hide is true", () => {
        expect(component.find("div#graphs-table").length).toBe(0);
    })
})
describe("GraphsTable UI Component", () => {
    it("Should be visible when hide is false", () => {
        expect(component.find("div#graphs-table").length).toBe(1);
    })
    it("Should call the onChange function when the proxy url texfield receives an input", () => {
        inputProxyURL("test.url")
        expect(onChangeProxyURLMockCallback).toHaveBeenCalledWith("test.url");
    })
    it("Should set the value of proxy url correctly", () => {
        expect(component
            .find("div#proxy-url-grid").find("input").props().value).toBe("test.url")
    })
    it("should call the onClick function when the add new proxy button is clicked", () => {
        inputProxyURL("test.url");
        clickAddProxy();
        expect(OnClickAddProxyMockCallback).toHaveBeenCalledWith("test.url");
    })
    it("Should list the graphs correctly in the table", () => {
        expect(component.find("table").text()).toBe("Graph IDDescription testGraphGraph Description")
    })
})
function inputProxyURL(url: string){
    component
        .find("div#proxy-url-grid")
        .find("input")
        .simulate("change", {
            target: { value: url },
        });
}
function clickAddProxy(){
    component.find("button#add-new-proxy-button").simulate("click");

}

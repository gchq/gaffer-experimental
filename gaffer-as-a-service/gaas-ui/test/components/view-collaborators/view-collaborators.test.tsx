/*
 * Copyright 2022 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import { mount, ReactWrapper } from "enzyme";
import { APIError } from "../../../src/rest/APIError";
import { GraphCollaborator } from "../../../src/domain/graph-collaborator";
import ViewCollaborators from "../../../src/components/view-collaborators/view-collaborators";
import { GetAllGraphCollaboratorsRepo } from "../../../src/rest/repositories/get-all-graph-collaborators-repo";
import { DeleteCollaboratorRepo } from "../../../src/rest/repositories/delete-collaborator-repo";

jest.mock("../../../src/rest/repositories/get-all-graph-collaborators-repo");

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({ state: { graphId: "graphId" } }),
}));

afterEach(() => {
    jest.resetAllMocks();
});

describe("When ViewCollaborators mounts", () => {
    it("should display Table Headers and Collaborators when GetCollaborators successful", async () => {
        mockGetAllGraphCollaboratorsToReturn([new GraphCollaborator("myGraph", "myUser")]);

        const wrapper: ReactWrapper = mount(
            <ViewCollaborators
                graphId={"myGraph"}
                errorMessage={"someMessage"}
                graphCollaborators={[new GraphCollaborator("myGraph", "myUser")]}
            />
        );
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find("thead").text()).toBe("Graph IDUser NameActions");
        expect(wrapper.find("tbody").text()).toBe("myGraphmyUser");
        expect(wrapper.find("caption").length).toBe(0);
    });
    it("should display No Collaborators caption when there are no collaborators", async () => {
        mockGetAllGraphCollaboratorsToReturn([]);

        const wrapper: ReactWrapper = mount(
            <ViewCollaborators
                graphId={"myGraph"}
                errorMessage={"someMessage"}
                graphCollaborators={[new GraphCollaborator("myGraph", "myUser")]}
            />
        );
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find("caption").text()).toBe("No Collaborators.");
    });
    it("should display Error Message in AlertNotification when GetGraphs request fails", async () => {
        mockGetAllGraphCollaboratorsThrowsError(() => {
            throw new APIError("Client Error", "404 Not Found");
        });

        const wrapper: ReactWrapper = mount(
            <ViewCollaborators
                graphId={"myGraph"}
                errorMessage={"someMessage"}
                graphCollaborators={[new GraphCollaborator("myGraph", "myUser")]}
            />
        );
        await wrapper.update();
        await wrapper.update();

        expect(wrapper.find("div#notification-alert").text()).toBe(
            "Failed to get all graph collaborators. Client Error: 404 Not Found"
        );
    });
    it("should delete collaborator when delete collaborator button click", async () => {
        mockGetAllGraphCollaboratorsToReturn([new GraphCollaborator("myGraph", "myUser")]);
        DeleteCollaboratorRepo.prototype.delete = jest.fn();
        const wrapper: ReactWrapper = mount(
            <ViewCollaborators
                graphId={"myGraph"}
                errorMessage={"someMessage"}
                graphCollaborators={[new GraphCollaborator("myGraph", "myUser")]}
            />
        );
        await wrapper.update();
        await wrapper.update();

        wrapper.find("tbody").find("button#view-collaborator-delete-button-0").simulate("click");
        expect(DeleteCollaboratorRepo.prototype.delete).toHaveBeenLastCalledWith("myGraph", "myUser");
    });

    function mockGetAllGraphCollaboratorsToReturn(graphCollaborators: GraphCollaborator[]): void {
        // @ts-ignore
        GetAllGraphCollaboratorsRepo.mockImplementationOnce(() => ({
            getAll: (graphId: string) =>
                new Promise((resolve) => {
                    resolve(graphCollaborators);
                }),
        }));
    }

    function mockGetAllGraphCollaboratorsThrowsError(f: () => void): void {
        // @ts-ignore
        GetAllGraphCollaboratorsRepo.mockImplementationOnce(() => ({
            getAll: f,
        }));
    }
});

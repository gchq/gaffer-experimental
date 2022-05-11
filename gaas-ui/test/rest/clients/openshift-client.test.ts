import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { OpenshiftClient } from "../../../src/rest/clients/openshift-client";

const mock = new MockAdapter(axios);
describe("RestClient whoami responses", () => {
    afterAll(() => mock.resetHandlers());
    it("should return a 200 status and response when GET is successful", async () => {
        mock.onGet("/whoami").reply(200, "test@test.com");
        const actual = await new OpenshiftClient().getWhoAmI();

        expect(actual).toEqual("test@test.com");
    });
    it("should throw 404 Error Message when api returns 404", async () => {
        mock.onGet("/whoami").reply(404, {
            title: "Not Found",
            detail: "User Email not found",
        });
        try {
            await new OpenshiftClient().getWhoAmI();
        } catch (e) {
            expect(e).toEqual({ detail: "User Email not found", title: "Not Found" });
        }
    });
});

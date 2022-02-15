import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { GetWhoAmIRepo } from "../../../src/rest/repositories/get-whoami-repo";
import { RestApiError } from "../../../src/rest/RestApiError";

const mock = new MockAdapter(axios);
const getWhoAmIRepo = new GetWhoAmIRepo();
describe("GetWhoAmIRepo", () => {
    it("Should return an email string when request is successful", async () => {
        const apiResponse: string = "test@test.com";
        mock.onGet("/whoami").reply(200, apiResponse);
        const actualResponse = await getWhoAmIRepo.getWhoAmI();
        expect(actualResponse).toEqual("test@test.com");
    });
    it("should throw RestApiError when 404 and have correct error message when no response body returned", async () => {
        mock.onGet("/whoami").reply(404);

        await expect(getWhoAmIRepo.getWhoAmI()).rejects.toEqual(new RestApiError("Error Code 404", "Not Found"));
    });
});

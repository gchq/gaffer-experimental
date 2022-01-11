import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

Enzyme.configure({ adapter: new Adapter() });

const syncify = async (fn: any) => {
    try {
        const result = await fn();
        return () => result;
    } catch (e) {
        return () => {
            throw e;
        };
    }
};

export default {
    syncify,
};

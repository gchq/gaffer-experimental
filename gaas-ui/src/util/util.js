export function isJSONObject(str) {
    try {
        const jsonObject = JSON.parse(str);
        if(jsonObject && typeof jsonObject === "object") {
            return true
        }
    } catch (e) {
        return false;
    }
    return false;
}

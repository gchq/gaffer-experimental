export enum StoreType {
    ACCUMULO = "A",
    MAPSTORE = "M",
    FEDERATED_STORE  = "F",
    PROXY_STORE  = "P",
}

export function getStoreType(storeType: string): StoreType {

    switch (storeType) {
        case "accumuloStore":
            return StoreType.ACCUMULO;
        case "mapStore":
            return StoreType.MAPSTORE;
        case "federatedStore":
            return StoreType.FEDERATED_STORE;
        case "proxyStore":
            return StoreType.PROXY_STORE;
        default:
             throw new Error(storeType+" is not a supported store type");

    }
}

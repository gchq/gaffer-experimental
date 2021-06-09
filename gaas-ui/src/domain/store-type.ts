export enum StoreType {
    OTHER = "O",
    FEDERATED_STORE  = "F",
    ACCUMULO = "A",
    MAPSTORE = "M",
    PROXY_STORE="P"
}

export function getStoreType(storeType: string): StoreType {

    switch (storeType) {
        case "accumuloStore":
            return StoreType.OTHER;
        case "mapStore":
            return StoreType.OTHER;
        case "federatedStore":
            return StoreType.FEDERATED_STORE;
        case "proxyStore":
            return StoreType.OTHER;
        default:
             throw new Error(storeType+" is not a supported store type");

    }
}

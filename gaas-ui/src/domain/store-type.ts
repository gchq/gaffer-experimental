export enum StoreType {
    ACCUMULO = "ACCUMULO",
    MAPSTORE = "MAPSTORE",
    FEDERATED_STORE = "FEDERATED_STORE",
    PROXY_STORE  = "PROXY_STORE",
}

// function getStoreType(storeType: string): StoreType {

//     switch (storeType) {

//         case "accumuloStore":
//             return StoreType.MAPSTORE;
//             break;
//         case "mapStore":
//             return StoreType.MAPSTORE;
//             break;
//         case "federatedStore":
//             return StoreType.MAPSTORE;
//             break;
//         default:
//             return StoreType.MAPSTORE;

//     }
// }

import { PropertyRequest } from "../types";

export const dummyRequestedProperty: PropertyRequest[] = [
    {
        id: 1,
        status: "Accepted", // replace with an actual value from FormRequestEventStatusText enum/type if needed
        fractions: "100",
        fractionsPrice: "1",
        acceptedPropertyId: 1,
        uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo"
    },
    {
        id: 2,
        status: "Accepted",
        fractions: "200",
        fractionsPrice: "2",
        acceptedPropertyId: 2,
        uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo"
    },
    {
        id: 3,
        status: "Accepted",
        fractions: "300",
        fractionsPrice: "3",
        acceptedPropertyId: 3,
        uri: "https://ipfs.io/ipfs/QmZDgxrZeaV7JkHhPdwLn7U5cqraGt7o7z7cAFP1oQcDBo"
    }
];

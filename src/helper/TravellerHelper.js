class TravellerHelper {
    constructor(config) {
        this.config = config;
    }

    normalizeTraveller(traveller = {}) {
        const gender = (traveller.gender || '').toLowerCase();
        const name = [traveller.firstName, traveller.lastName].filter(Boolean).join(' ');
        return JSON.parse(JSON.stringify({
            salutation: (this.config.gender2SalutationMap || {})[gender] || void 0,
            name: name.length ? name : void 0,
            age: traveller.age,
        }));
    }

    collectTravellers(travellerAssociation = '', getTravellerByLineNumber) {
        let travellers = [];

        let startLineNumber = parseInt(travellerAssociation.substr(0, 1), 10);
        let endLineNumber = parseInt(travellerAssociation.substr(-1), 10);

        if (startLineNumber) {
            do {
                travellers.push(getTravellerByLineNumber(startLineNumber));
            } while (++startLineNumber <= endLineNumber);
        }

        return travellers.filter(Boolean);
    }

    extractLastTravellerAssociation(travellerAssociation = '') {
        return travellerAssociation.split('-').pop();
    }

    extractFirstTravellerAssociation(travellerAssociation = '') {
        return travellerAssociation.split('-').shift();
    }
}

export {
    TravellerHelper as default,
}

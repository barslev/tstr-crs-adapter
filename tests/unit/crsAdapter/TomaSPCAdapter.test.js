import TomaSPCAdapter from '../../../src/crsAdapter/TomaSPCAdapter';
import {DEFAULT_OPTIONS, SERVICE_TYPES} from '../../../src/UbpCrsAdapter';

describe('TomaSPCAdapter', () => {
    let adapter, documentHeadAppendChildSpy, TomaSPCConnection;

    beforeEach(() => {
        let logService = require('tests/unit/_mocks/LogService')();

        adapter = new TomaSPCAdapter(logService, DEFAULT_OPTIONS);

        documentHeadAppendChildSpy = spyOn(document.head, 'appendChild');
        documentHeadAppendChildSpy.and.callFake((script) => script.onload());

        TomaSPCConnection = require('tests/unit/_mocks/TomaSPCConnection')();
        TomaSPCConnection.connect.and.callFake((paramObject) => paramObject.fn.onSuccess());

        window.catalog = TomaSPCConnection;
    });

    afterEach(() => {
        window.history.replaceState({}, '', 0);
    });

    it('connect() should result in correct script.src', (done) => {
        let expectedSrc = 'https://www.em1.sellingplatformconnect.amadeus.com/ExternalCatalog.js';
        let expectedDest = 'https://www.em1.sellingplatformconnect.amadeus.com';

        adapter.connect().then(() => {
            let scriptElement = documentHeadAppendChildSpy.calls.mostRecent().args[0];

            expect(scriptElement.src).toBe(expectedSrc);
            expect(TomaSPCConnection.dest).toBe(expectedDest);
            done();
        }, (error) => {
            done.fail(error);
        });
    });

    it('connect() with option.crsUrl should result in correct script.src', (done) => {
        let expectedSrc = 'https://crsurl/ExternalCatalog.js';
        let expectedDest = 'https://crsUrl';

        adapter.connect({crsUrl: 'http://crsUrl'}).then(() => {
            let scriptElement = documentHeadAppendChildSpy.calls.mostRecent().args[0];

            expect(scriptElement.src).toBe(expectedSrc);
            expect(TomaSPCConnection.dest).toBe(expectedDest);
            done();
        }, (error) => {
            done.fail(error);
        });
    });

    it('connect() with option.env "test" should result in correct script.src', (done) => {
        let expectedSrc = 'https://acceptance.emea1.sellingplatformconnect.amadeus.com/ExternalCatalog.js';
        let expectedDest = 'https://acceptance.emea1.sellingplatformconnect.amadeus.com';

        adapter.connect({env: 'test'}).then(() => {
            let scriptElement = documentHeadAppendChildSpy.calls.mostRecent().args[0];

            expect(scriptElement.src).toBe(expectedSrc);
            expect(TomaSPCConnection.dest).toBe(expectedDest);
            done();
        }, (error) => {
            done.fail(error);
        });
    });

    it('connect() with option.env "prod" should result in correct script.src', (done) => {
        let expectedSrc = 'https://www.em1.sellingplatformconnect.amadeus.com/ExternalCatalog.js';
        let expectedDest = 'https://www.em1.sellingplatformconnect.amadeus.com';

        adapter.connect({env: 'prod'}).then(() => {
            let scriptElement = documentHeadAppendChildSpy.calls.mostRecent().args[0];

            expect(scriptElement.src).toBe(expectedSrc);
            expect(TomaSPCConnection.dest).toBe(expectedDest);
            done();
        }, (error) => {
            done.fail(error);
        });
    });

    it('connect() with URL parameter crs_url should result in correct script.src', (done) => {
        let expectedSrc = 'https://crsurl/ExternalCatalog.js';
        let expectedDest = 'https://crsUrl';

        window.history.replaceState({}, '', '?crs_url=http://crsUrl');

        adapter.connect().then(() => {
            let scriptElement = documentHeadAppendChildSpy.calls.mostRecent().args[0];

            expect(scriptElement.src).toBe(expectedSrc);
            expect(TomaSPCConnection.dest).toBe(expectedDest);
            done();
        }, (error) => {
            done.fail(error);
        });
    });

    it('connect() with option.externalCatalogVersion should result in correct script.src', (done) => {
        let expectedSrc = 'https://www.em1.sellingplatformconnect.amadeus.com/ExternalCatalog.js?version=externalCatalogVersion';
        let expectedDest = 'https://www.em1.sellingplatformconnect.amadeus.com';

        adapter.connect({externalCatalogVersion: 'externalCatalogVersion'}).then(() => {
            let scriptElement = documentHeadAppendChildSpy.calls.mostRecent().args[0];

            expect(scriptElement.src).toBe(expectedSrc);
            expect(TomaSPCConnection.dest).toBe(expectedDest);
            done();
        }, (error) => {
            done.fail(error);
        });
    });

    it('connect() with URL parameter EXTERNAL_CATALOG_VERSION should result in correct script.src', (done) => {
        let expectedSrc = 'https://www.em1.sellingplatformconnect.amadeus.com/ExternalCatalog.js?version=url.catalogVersion';
        let expectedDest = 'https://www.em1.sellingplatformconnect.amadeus.com';

        window.history.replaceState({}, '', '?EXTERNAL_CATALOG_VERSION=url.catalogVersion');

        adapter.connect().then(() => {
            let scriptElement = documentHeadAppendChildSpy.calls.mostRecent().args[0];

            expect(scriptElement.src).toBe(expectedSrc);
            expect(TomaSPCConnection.dest).toBe(expectedDest);
            done();
        }, (error) => {
            done.fail(error);
        });
    });

    describe('is connected with TOMA SPC -', () => {
        let crsData, responseError, responseWarnings, requestData, requestMethod;

        beforeEach(() => {
            TomaSPCConnection.requestService.and.callFake((type, params, callback) => {
                requestMethod = type;
                requestData = params;

                let response = {
                    data: crsData,
                    error: responseError,
                    warnings: responseWarnings,
                };

                if (callback) {
                    return callback.fn.onSuccess(response);
                }
            });

            crsData = responseWarnings = responseError = requestData = void 0;

            adapter.connect();
        });

        it('getData() should parse base data', (done) => {
            let expected = {
                agencyNumber: 'agNum',
                operator: 'op',
                numberOfTravellers: 'numberOfTravellers',
                travelType: 'tt',
                remark: 'rmrk',
                services: [],
            };

            crsData = {
                agencyNumber: 'agNum',
                operator: 'op',
                numTravellers: 'numberOfTravellers',
                traveltype: 'tt',
                remark: 'rmrk',
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse complete car service data', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        pickUpDate: '09112017',
                        dropOffDate: '21112017',
                        pickUpTime: '0915',
                        duration: 12,
                        rentalCode: 'USA81',
                        vehicleTypeCode: 'E4',
                        pickUpLocation: 'LAX',
                        dropOffLocation: 'SFO',
                        marked: false,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: false,
                        serviceType: 'MW',
                        serviceCode: 'USA81E4/LAX-SFO',
                        accommodation: '0915',
                        fromDate: '091117',
                        toDate: '211117',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse marked car service data with complete serviceCode', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        rentalCode: 'USA81',
                        vehicleTypeCode: 'E4',
                        pickUpLocation: 'LAX',
                        dropOffLocation: 'SFO',
                        marked: true,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: true,
                        serviceType: 'MW',
                        serviceCode: 'USA81E4/LAX-SFO',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse car service data without serviceCode', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        marked: true,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: false,
                        serviceType: 'MW',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse car service data with half serviceCode', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        rentalCode: 'USA',
                        pickUpLocation: 'LAX',
                        dropOffLocation: 'SFO',
                        marked: true,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: false,
                        serviceType: 'MW',
                        serviceCode: 'USA/LAX-SFO',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse car service data with minimal serviceCode', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        pickUpLocation: 'LAX',
                        marked: true,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: false,
                        serviceType: 'MW',
                        serviceCode: 'LAX',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse hotel service data', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.hotel,
                        roomCode: 'rc',
                        mealCode: 'mc',
                        destination: 'destination',
                        dateFrom: '11122017',
                        dateTo: '22122017',
                        marked: false,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: false,
                        serviceType: 'H',
                        serviceCode: 'destination',
                        accommodation: 'rc mc',
                        fromDate: '111217',
                        toDate: '221217',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse hotel service data as marked if no destination is set', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.hotel,
                        roomCode: 'rc',
                        mealCode: 'mc',
                        marked: true,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: false,
                        serviceType: 'H',
                        accommodation: 'rc mc',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse hotel service data as marked if no accommodation is set', (done) => {
            let expected = {
                services: [
                    {
                        type: SERVICE_TYPES.hotel,
                        destination: 'destination',
                        marked: true,
                    }
                ],
            };

            crsData = {
                services: [
                    {
                        marker: false,
                        serviceType: 'H',
                        serviceCode: 'destination',
                    }
                ],
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should not parse unknown service', (done) => {
            let expected = {services: []};

            crsData = {services: [{
                serviceType: 'unknown',
            }]};

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse complete camper service data', (done) => {
            let expected = {services: [{
                type: SERVICE_TYPES.camper,
                pickUpDate: '09112017',
                dropOffDate: '21112017',
                pickUpTime: '0915',
                duration: 12,
                renterCode: 'USA96',
                camperCode: 'A4',
                pickUpLocation: 'MIA1',
                dropOffLocation: 'TPA',
                milesIncludedPerDay: '200',
                milesPackagesIncluded: '3',
                marked: false,
            }]};

            crsData = {
                services: [{
                    serviceType: 'WM',
                    serviceCode: 'USA96A4/MIA1-TPA',
                    accommodation: '0915',
                    fromDate: '091117',
                    toDate: '211117',
                    quantity: '200',
                    occupancy: '3',
                }]
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse minimal camper service data', (done) => {
            let expected = {services: [{
                type: SERVICE_TYPES.camper,
                pickUpLocation: 'MIA1',
                marked: true,
            }]};

            crsData = {
                services: [{
                    serviceType: 'WM',
                    serviceCode: 'MIA1',
                }]
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse camper service with no service code', (done) => {
            let expected = {services: [{
                type: SERVICE_TYPES.camper,
                marked: true,
            }]};

            crsData = {
                services: [{
                    serviceType: 'WM',
                }]
            };

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse service data without serviceType', (done) => {
            let expected = {services: []};

            crsData = {services: [{}]};

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should parse no object for no crs data', (done) => {
            let expected = void 0;

            crsData = void 0;

            adapter.getData().then((data) => {
                expect(data).toEqual(expected);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('getData() should throw error if response has errors', (done) => {
            responseError = {
                code: 313,
                message: 'error message',
            };

            responseWarnings = [{
                code: 111,
                message: 'warning message',
            }];

            adapter.getData().then(() => {
                done.fail('expectation error');
            }, (error) => {
                expect(error.toString()).toBe('Error: [.getData] can not get data - caused by faulty response');
                done();
            });
        });

        it('getData() should throw error if request fails', (done) => {
            TomaSPCConnection.requestService.and.callFake((type, params, callback) => {
                return callback.fn.onError({
                    error: {code: 414, message: 'error on request'},
                });
            });

            adapter.getData().then(() => {
                done.fail('expectation error');
            }, (error) => {
                expect(error.toString()).toBe('Error: [.getData] can not get data - something went wrong with the request');
                done();
            });
        });

        it('setData() should convert no adapter object to crs object correct', (done) => {
            let expected = {
                action: 'BA',
                numTravellers: 1,
            };

            adapter.setData().then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should convert empty adapter object to crs object correct', (done) => {
            let adapterObject = {};
            let expected = {
                action: 'BA',
                numTravellers: 1,
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should convert base data to crs object correct and trigger exit', (done) => {
            let adapterObject = {
                numberOfTravellers: 2,
                remark: 'rmrk',
                services: [{ type: 'unknown' }],
            };

            let expected = {
                action: 'BA',
                numTravellers: 2,
                remark: 'rmrk',
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should convert complete car data to crs object correct', (done) => {
            let adapterObject = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        rentalCode: 'USA81',
                        vehicleTypeCode: 'E4',
                        pickUpLocation: 'LAS',
                        dropOffLocation: 'SFO',
                        pickUpDate: '04052018',
                        dropOffDate: '07052018',
                        duration: 14,
                        pickUpTime: '1730',
                        pickUpHotelName: 'puh name',
                        pickUpHotelAddress: 'puh address',
                        pickUpHotelPhoneNumber: 'puh number',
                        dropOffHotelName: 'doh name',
                        dropOffHotelAddress: 'doh address',
                        dropOffHotelPhoneNumber: 'doh number',
                        extras: ['navigationSystem', 'childCareSeat0', 'childCarSeat10', 'roofRack'],
                    },
                ],
            };

            let expected = {
                action: 'BA',
                numTravellers: 1,
                remark: 'GPS|BS|childCarSeat10|roofRack,puh address puh number|doh name|doh address doh number',
                services: [
                    {
                        serviceType: 'MW',
                        serviceCode: 'USA81E4/LAS-SFO',
                        fromDate: '040518',
                        toDate: '070518',
                        accommodation: '1730',
                    },
                    {
                        serviceType: 'E',
                        serviceCode: 'puh name',
                        fromDate: '040518',
                        toDate: '070518',
                    },
                ],
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should convert minimal car data to crs object correct', (done) => {
            let adapterObject = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        rentalCode: 'USA81',
                        vehicleTypeCode: 'E4',
                        pickUpLocation: 'LAS',
                        dropOffLocation: 'SFO',
                        pickUpDate: '04052018',
                        duration: 14,
                        pickUpTime: '1730',
                    },
                ],
            };

            let expected = {
                action: 'BA',
                numTravellers: 1,
                services: [
                    {
                        serviceType: 'MW',
                        serviceCode: 'USA81E4/LAS-SFO',
                        fromDate: '040518',
                        toDate: '180518',
                        accommodation: '1730',
                    },
                ],
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should convert only dropOff hotel car data to crs object correct', (done) => {
            let adapterObject = {
                services: [
                    {
                        type: SERVICE_TYPES.car,
                        rentalCode: 'USA81',
                        vehicleTypeCode: 'E4',
                        pickUpLocation: 'LAS',
                        dropOffLocation: 'SFO',
                        pickUpDate: '04052018',
                        duration: 14,
                        pickUpTime: '1730',
                        dropOffHotelName: 'doh name',
                        dropOffHotelAddress: 'doh address',
                        dropOffHotelPhoneNumber: 'doh number',
                    },
                ],
            };

            let expected = {
                action: 'BA',
                numTravellers: 1,
                remark: 'doh address doh number',
                services: [
                    {
                        serviceType: 'MW',
                        serviceCode: 'USA81E4/LAS-SFO',
                        fromDate: '040518',
                        toDate: '180518',
                        accommodation: '1730',
                    },
                    {
                        serviceType: 'E',
                        serviceCode: 'doh name',
                        fromDate: '040518',
                        toDate: '180518',
                    },
                ],
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should convert hotel data to crs object correct', (done) => {
            let adapterObject = {
                services: [
                    {
                        type: SERVICE_TYPES.hotel,
                        destination: 'destination',
                        roomCode: 'rc',
                        mealCode: 'mc',
                        dateFrom: '01012018',
                        dateTo: '08012018',
                    },
                ],
            };

            let expected = {
                action: 'BA',
                numTravellers: 1,
                services: [
                    {
                        serviceType: 'H',
                        serviceCode: 'destination',
                        accommodation: 'rc mc',
                        fromDate: '010118',
                        toDate: '080118',
                    },
                ],
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should convert camper data to crs object correct', (done) => {
            let adapterObject = {
                numberOfTravellers: 2,
                services: [
                    {
                        type: SERVICE_TYPES.camper,
                        renterCode: 'USA89',
                        camperCode: 'A4',
                        pickUpLocation: 'MIA1',
                        dropOffLocation: 'TPA',
                        pickUpDate: '04052018',
                        dropOffDate: '07052018',
                        duration: 14,
                        pickUpTime: '1730',
                        milesIncludedPerDay: '200',
                        milesPackagesIncluded: '4',
                        extras: ['extra.3', 'special'],
                    },
                ],
            };

            let expected = {
                action: 'BA',
                numTravellers: 2,
                services: [
                    {
                        serviceType: 'WM',
                        serviceCode: 'USA89A4/MIA1-TPA',
                        fromDate: '040518',
                        toDate: '070518',
                        accommodation: '1730',
                        quantity: '200',
                        occupancy: '4',
                        travellerAssociation: '1-2',
                    },
                    {
                        serviceType: 'TA',
                        serviceCode: 'extra',
                        fromDate: '040518',
                        toDate: '070518',
                        travellerAssociation: '1-3'
                    },
                    {
                        serviceType: 'TA',
                        serviceCode: 'special',
                        fromDate: '040518',
                        toDate: '070518',
                        travellerAssociation: '1'
                    },
                ],
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should overwrite selected crs service with adapter data correct', (done) => {
            crsData = {
                services: [
                    {
                        serviceType: 'MW',
                    },
                    {
                        serviceType: 'H',
                    },
                    {
                        serviceType: 'H',
                        serviceCode: 'state',
                        accommodation: 'king size'
                    },
                    {
                        marker: true,
                        serviceType: 'H',
                        accommodation: 'all inc',
                    },
                ],
            };

            let adapterObject = {
                services: [
                    {
                        type: SERVICE_TYPES.hotel,
                        destination: 'destination',
                        roomCode: 'rc',
                        mealCode: 'mc',
                        dateFrom: '01012018',
                        dateTo: '08012018',
                    },
                ],
            };

            let expected = {
                action: 'BA',
                numTravellers: 1,
                services: [
                    {
                        serviceType: 'MW',
                    },
                    {
                        serviceType: 'H',
                    },
                    {
                        serviceType: 'H',
                        serviceCode: 'state',
                        accommodation: 'king size'
                    },
                    {
                        marker: true,
                        serviceType: 'H',
                        serviceCode: 'destination',
                        accommodation: 'rc mc',
                        fromDate: '010118',
                        toDate: '080118',
                    },
                ],
            };

            adapter.setData(adapterObject).then(() => {
                expect(requestData).toEqual([expected]);
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('setData() should throw error if connection is not available', (done) => {
            TomaSPCConnection.requestService = void 0;

            adapter.setData().then(() => {
                done.fail('expectation error');
            }, (error) => {
                expect(error.toString()).toBe('Error: [.setData] No connection available - please connect to TOMA SPC first.');
                done();
            });
        });

        it('exit() should request to close the popup', (done) => {
            adapter.exit({popupId: 'pId'}).then(() => {
                expect(requestData).toEqual({id: 'pId'});
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('exit() should request to close the popup with popup id from url parameter', (done) => {
            window.history.replaceState({}, '', '/#/?POPUP_ID=url.pId');

            adapter.exit().then(() => {
                expect(requestData).toEqual({id: 'url.pId'});
                done();
            }, (error) => {
                done.fail(error);
            });
        });

        it('exit() should throw error if no popup id is available', (done) => {
            adapter.exit().then(() => {
                done.fail('expectation error');
            }, (error) => {
                expect(error.toString()).toBe('Error: can not exit - popupId is missing');
                done();
            });
        });

        it('exitData() should throw error if connection failed', (done) => {
            TomaSPCConnection.requestService = void 0;

            adapter.exit({popupId: 'id'}).then(() => {
                done.fail('expectation error');
            }, (error) => {
                expect(error.toString()).toBe('Error: connection::popups.close: No connection available - please connect to TOMA SPC first.');
                done();
            });
        });
    });
});

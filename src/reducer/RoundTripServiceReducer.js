import moment from 'moment/moment';

class RoundTripServiceReducer {
    constructor(logger, config, helper) {
        this.config = config;
        this.helper = helper;
        this.logger = logger;
    }

    reduceIntoCrsData(adapterService, crsData) {
        if (!adapterService) {
            return;
        }

        crsData.normalized.services = crsData.normalized.services || [];

        const crsService = this.helper.service.findEditableService(crsData) || this.helper.service.createEmptyService(crsData);
        const startDate = moment(adapterService.startDate, this.config.useDateFormat);
        const endDate = moment(adapterService.endDate, this.config.useDateFormat);

        crsService.type = crsData.meta.serviceTypes.roundTrip;
        crsService.marker = adapterService.marked ? 'X' : void 0;

        crsService.code = adapterService.bookingId ? 'NEZ' + adapterService.bookingId : void 0;
        crsService.accommodation = adapterService.destination;
        crsService.fromDate = startDate.isValid() ? startDate.format(crsData.meta.formats.date) : adapterService.startDate;
        crsService.toDate = endDate.isValid() ? endDate.format(crsData.meta.formats.date) : adapterService.endDate;

        this.helper.traveller.reduceTravellersIntoCrsData(adapterService, crsService, crsData);
    }
}

export default RoundTripServiceReducer;

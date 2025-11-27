"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityStatus = exports.PropertyType = void 0;
/**
 * Property type enum
 */
var PropertyType;
(function (PropertyType) {
    PropertyType["APARTMENT"] = "apartment";
    PropertyType["HOUSE"] = "house";
    PropertyType["ROOM"] = "room";
    PropertyType["VENUE"] = "venue";
    PropertyType["OFFICE"] = "office";
    PropertyType["OTHER"] = "other";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
/**
 * Availability status enum
 */
var AvailabilityStatus;
(function (AvailabilityStatus) {
    AvailabilityStatus["AVAILABLE"] = "available";
    AvailabilityStatus["UNAVAILABLE"] = "unavailable";
    AvailabilityStatus["RESERVED"] = "reserved";
    AvailabilityStatus["MAINTENANCE"] = "maintenance";
})(AvailabilityStatus || (exports.AvailabilityStatus = AvailabilityStatus = {}));
//# sourceMappingURL=Property.js.map
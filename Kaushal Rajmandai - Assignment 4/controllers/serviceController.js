const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
  isNonEmptyString,
  isUUID,
  isValidPrice,
  isValidDuration,
  trimString
} = require('../utils/validate');
const Service = require('../models/Service');

const getAvailable = asyncHandler(async (req, res) => {
  const services = await Service.findAvailable({
    city: req.query.city,
    maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined
  });
  sendSuccess(res, 200, services, 'Available services fetched');
});

const getById = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid service id');
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  sendSuccess(res, 200, service, 'Service fetched');
});

const update = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid service id');

  const payload = {};
  if (req.body.serviceName !== undefined) {
    const serviceName = trimString(req.body.serviceName);
    if (!isNonEmptyString(serviceName) || serviceName.length < 2 || serviceName.length > 100) {
      throw new ApiError(400, 'Service name must be 2-100 characters');
    }
    payload.service_name = serviceName;
  }
  if (req.body.price !== undefined) {
    if (!isValidPrice(req.body.price)) throw new ApiError(400, 'Price must be a non-negative number');
    payload.price = req.body.price;
  }
  if (req.body.duration !== undefined) {
    const duration = trimString(req.body.duration);
    if (!isValidDuration(duration)) {
      throw new ApiError(400, 'Duration must start with a number, e.g. "40 min"');
    }
    payload.duration = duration;
  }
  if (req.body.isAvailable !== undefined) {
    if (typeof req.body.isAvailable !== 'boolean') {
      throw new ApiError(400, 'isAvailable must be a boolean');
    }
    payload.is_available = req.body.isAvailable;
  }

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'At least one field is required to update');
  }

  const service = await Service.update(req.params.id, payload);
  if (!service) throw new ApiError(404, 'Service not found');
  sendSuccess(res, 200, service, 'Service updated successfully');
});

const remove = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid service id');
  const service = await Service.remove(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  sendSuccess(res, 200, service, 'Service deleted successfully');
});

module.exports = { getAvailable, getById, update, remove };
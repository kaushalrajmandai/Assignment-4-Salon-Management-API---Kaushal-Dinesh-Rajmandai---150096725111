const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { isNonEmptyString, isUUID, isValidRating, trimString } = require('../utils/validate');
const Salon = require('../models/Salon');
const Service = require('../models/Service');

const getAll = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { salons, total } = await Salon.findAll({
    city: req.query.city,
    minRating: req.query.minRating !== undefined ? Number(req.query.minRating) : undefined,
    limit,
    offset
  });

  sendSuccess(res, 200, { salons, total, page, limit }, 'Salons fetched');
});

const getTop = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const salons = await Salon.findTop(limit);
  sendSuccess(res, 200, salons, 'Top salons fetched');
});

const getByCity = asyncHandler(async (req, res) => {
  const salons = await Salon.findByCity(req.params.city);
  sendSuccess(res, 200, salons, `Salons in ${req.params.city} fetched`);
});

const getById = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid salon id');
  const salon = await Salon.findById(req.params.id);
  if (!salon) throw new ApiError(404, 'Salon not found');
  sendSuccess(res, 200, salon, 'Salon fetched');
});

const create = asyncHandler(async (req, res) => {
  const name = trimString(req.body.name);
  const city = trimString(req.body.city);
  const address = trimString(req.body.address);
  const rating = req.body.rating;

  if (!isNonEmptyString(name) || name.length < 2 || name.length > 100) {
    throw new ApiError(400, 'Salon name must be 2-100 characters');
  }
  if (!isNonEmptyString(city)) throw new ApiError(400, 'City is required');
  if (!isNonEmptyString(address) || address.length < 5 || address.length > 255) {
    throw new ApiError(400, 'Address must be 5-255 characters');
  }
  if (rating !== undefined && !isValidRating(rating)) {
    throw new ApiError(400, 'Rating must be between 0 and 5');
  }

  const salon = await Salon.create({ name, city, address, rating: rating ?? null });
  sendSuccess(res, 201, salon, 'Salon created successfully');
});

const update = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid salon id');

  const payload = {};
  if (req.body.name !== undefined) payload.name = trimString(req.body.name);
  if (req.body.city !== undefined) payload.city = trimString(req.body.city);
  if (req.body.address !== undefined) payload.address = trimString(req.body.address);
  if (req.body.rating !== undefined) {
    if (!isValidRating(req.body.rating)) throw new ApiError(400, 'Rating must be between 0 and 5');
    payload.rating = req.body.rating;
  }

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'At least one field is required to update');
  }

  const salon = await Salon.update(req.params.id, payload);
  if (!salon) throw new ApiError(404, 'Salon not found');
  sendSuccess(res, 200, salon, 'Salon updated successfully');
});

const remove = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid salon id');
  const salon = await Salon.remove(req.params.id);
  if (!salon) throw new ApiError(404, 'Salon not found');
  sendSuccess(res, 200, salon, 'Salon deleted successfully');
});

const getServices = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid salon id');

  const salon = await Salon.findById(req.params.id);
  if (!salon) throw new ApiError(404, 'Salon not found');

  const isAvailable =
    req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined;

  const services = await Service.findBySalon(req.params.id, { isAvailable });
  sendSuccess(res, 200, services, 'Services fetched');
});

const addService = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) throw new ApiError(400, 'Invalid salon id');

  const salon = await Salon.findById(req.params.id);
  if (!salon) throw new ApiError(404, 'Salon not found');

  const { isValidDuration, isValidPrice } = require('../utils/validate');
  const serviceName = trimString(req.body.serviceName);
  const price = req.body.price;
  const duration = trimString(req.body.duration);
  const isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : true;

  if (!isNonEmptyString(serviceName) || serviceName.length < 2 || serviceName.length > 100) {
    throw new ApiError(400, 'Service name must be 2-100 characters');
  }
  if (!isValidPrice(price)) throw new ApiError(400, 'Price must be a non-negative number');
  if (!isValidDuration(duration)) {
    throw new ApiError(400, 'Duration must start with a number, e.g. "40 min"');
  }
  if (typeof isAvailable !== 'boolean') {
    throw new ApiError(400, 'isAvailable must be a boolean');
  }

  const service = await Service.create({
    salon_id: req.params.id,
    service_name: serviceName,
    price,
    duration,
    is_available: isAvailable
  });

  sendSuccess(res, 201, service, 'Service added successfully');
});

module.exports = { getAll, getTop, getByCity, getById, create, update, remove, getServices, addService };
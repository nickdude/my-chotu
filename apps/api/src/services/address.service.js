const addressRepo = require('../repositories/address.repository');
const { NotFoundError } = require('../utils/errors');

const getAddresses = (userId) => addressRepo.findAllByUser(userId);

const addAddress = (userId, data) => addressRepo.create(userId, data);

const setDefault = async (userId, id) => {
  const address = await addressRepo.findByIdAndUser(id, userId);
  if (!address) throw new NotFoundError('Address');
  return addressRepo.setDefault(id, userId);
};

module.exports = { getAddresses, addAddress, setDefault };

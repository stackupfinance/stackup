const { Payment } = require('../models');

const createNewPayment = async (newPayment) => {
  return Payment.create(newPayment);
};

const queryPayments = async (filter, options) => {
  const payments = await Payment.paginate(filter, options);
  return payments;
};

const getPaymentById = async (id) => {
  return Payment.findById(id);
};

const updatePaymentDoc = async (doc, updates) => {
  Object.assign(doc, updates);
  return doc.save();
};

module.exports = {
  createNewPayment,
  queryPayments,
  getPaymentById,
  updatePaymentDoc,
};

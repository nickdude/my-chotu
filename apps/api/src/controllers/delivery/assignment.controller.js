const assignmentService = require('../../services/delivery/assignment.service');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const getActive     = asyncHandler(async (req, res) => {
  const list = await assignmentService.getActiveAssignments(req.user.sub);
  return success(res, list);
});

const getHistory    = asyncHandler(async (req, res) => {
  const { assignments, meta } = await assignmentService.getHistory(req.user.sub, req.query);
  return success(res, { assignments, meta });
});

const getOne        = asyncHandler(async (req, res) => {
  const a = await assignmentService.getAssignment(req.user.sub, req.params.id);
  return success(res, a);
});

const updateStatus  = asyncHandler(async (req, res) => {
  const a = await assignmentService.updateStatus(req.user.sub, req.params.id, req.body);
  return success(res, a);
});

const requestOtp    = asyncHandler(async (req, res) => {
  const result = await assignmentService.requestDeliveryOtp(req.user.sub, req.params.id);
  return success(res, result, 'OTP sent to customer');
});

const submitProof   = asyncHandler(async (req, res) => {
  const a = await assignmentService.submitProof(req.user.sub, req.params.id, req.body);
  return success(res, a, 'Delivery confirmed');
});

module.exports = { getActive, getHistory, getOne, updateStatus, requestOtp, submitProof };

const staffService = require('../../services/delivery/staff.service');
const codService   = require('../../services/delivery/cod.service');
const assignmentService = require('../../services/delivery/assignment.service');
const { success, created } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const listStaff    = asyncHandler(async (req, res) => {
  const staff = await staffService.listStaff(req.shop.id);
  return success(res, staff);
});

const addStaff     = asyncHandler(async (req, res) => {
  const member = await staffService.addStaff(req.shop.id, req.body);
  return created(res, member, 'Staff added');
});

const toggleStaff  = asyncHandler(async (req, res) => {
  const member = await staffService.toggleStaff(req.shop.id, req.params.id);
  return success(res, member, 'Staff status updated');
});

const assignDelivery = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.assignStaff(
    req.shop.id, req.params.orderId, req.body.staffId, req.user.sub
  );
  return created(res, assignment, 'Delivery assigned');
});

const listCod      = asyncHandler(async (req, res) => {
  const records = await codService.listUnreconciled(req.shop.id);
  return success(res, records);
});

const reconcileCod = asyncHandler(async (req, res) => {
  const record = await codService.reconcile(req.shop.id, req.params.assignmentId, req.user.sub);
  return success(res, record, 'COD reconciled');
});

module.exports = { listStaff, addStaff, toggleStaff, assignDelivery, listCod, reconcileCod };

const { supabase } = require('../db/supabase');
const ESTIMATE_STATUS = require('../constants/estimate-status');
const APPROVAL_STATUS = require('../constants/approval-status');

/**
 * Shared Helper: Recalculates the estimate amount based on its current status.
 * Note: Does not update last_modified_by.
 */
async function _recalculateEstimateAmount(estimateId, currentStatus) {
  const { data: items, error } = await supabase
    .from('project_cost_estimate_items')
    .select('amount, zo_office_approve, ho_office_approve')
    .eq('estimate_id', estimateId);

  if (error) throw error;

  let newAmount = 0;

  if (
    [
      ESTIMATE_STATUS.DRAFT,
      ESTIMATE_STATUS.SUBMITTED,
      ESTIMATE_STATUS.UNDER_ZO_REVIEW,
      ESTIMATE_STATUS.ZO_REVISION_REQUESTED,
      ESTIMATE_STATUS.REJECTED_BY_ZO,
      ESTIMATE_STATUS.REJECTED_BY_HO
    ].includes(currentStatus)
  ) {
    newAmount = (items || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  } else if (
    [
      ESTIMATE_STATUS.ZO_APPROVED,
      ESTIMATE_STATUS.UNDER_HO_REVIEW,
      ESTIMATE_STATUS.HO_REVISION_REQUESTED,
      ESTIMATE_STATUS.ESTIMATE_REOPENED
    ].includes(currentStatus)
  ) {
    newAmount = (items || [])
      .filter(item => item.zo_office_approve === APPROVAL_STATUS.APPROVED)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  } else if (currentStatus === ESTIMATE_STATUS.FINAL_APPROVED) {
    newAmount = (items || [])
      .filter(item => item.zo_office_approve === APPROVAL_STATUS.APPROVED && item.ho_office_approve === APPROVAL_STATUS.APPROVED)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  } else {
    newAmount = (items || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  newAmount = Math.round(newAmount * 100) / 100;

  const { error: updateError } = await supabase
    .from('project_cost_estimates')
    .update({ estimate_amount: newAmount })
    .eq('estimate_id', estimateId);

  if (updateError) throw updateError;

  return newAmount;
}

module.exports = {
  _recalculateEstimateAmount
};

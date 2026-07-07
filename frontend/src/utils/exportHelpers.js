import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

export function exportToExcel(estimate, items) {
  if (!estimate || !items || items.length === 0) {
    alert('No items to export.');
    return;
  }

  // Format line items
  const formattedRows = items.map((item, index) => ({
    "Sl. No.": index + 1,
    "Work Order No.": estimate.work_order_no || '',
    "Estimate No.": estimate.estimate_no || '',
    "Area Code": estimate.area_code || '',
    "Estimate Status": estimate.estimate_status || '',
    "Main Head": item.material_main_head || '',
    "Sub Head": item.material_sub_head || '',
    "Material Details": item.material_details || '',
    "Unit": item.unit || '',
    "Quantity": item.qty || 0,
    "Rate (INR)": item.rate || 0,
    "Amount (INR)": item.amount || 0,
    "ZO Approve Status": item.zo_office_approve || 'Pending',
    "ZO Remarks": item.zo_remarks || '',
    "HO Approve Status": item.ho_office_approve || 'Pending',
    "HO Remarks": item.ho_remarks || '',
    "Source of Purchase": item.purchase_data?.name || item.source_of_purchase || 'N/A'
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Line Items");

  // Save workbook
  const filename = `Estimate_${estimate.estimate_no || 'Draft'}_Rev_${estimate.estimate_revision || 0}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function exportToPDF(elementId, estimateNo) {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Print area element not found.');
    return;
  }

  const options = {
    margin: [10, 10, 10, 10],
    filename: `Estimate_${estimateNo || 'Draft'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(options).from(element).save();
}

export function exportMaterialsToExcel(materials) {
  if (!materials || materials.length === 0) {
    alert('No materials to export.');
    return;
  }

  const formattedRows = materials.map((m, index) => ({
    "Sl. No.": index + 1,
    "Main Head": m.Material_Main_Head || '',
    "Sub Head": m.Material_Sub_Head || '',
    "Material Details": m.Material_Details || '',
    "Unit": m.M_Unit || '',
    "Status": m.is_active ? 'Active' : 'Inactive'
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Material Master");

  XLSX.writeFile(workbook, `Material_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportProjectsToExcel(projects) {
  if (!projects || projects.length === 0) {
    alert('No projects to export.');
    return;
  }

  const formattedRows = projects.map((p, index) => ({
    "Sl. No.": index + 1,
    "Work Order No.": p.work_order_no || '',
    "Estimate No.": p.estimate_no || '',
    "Work Order Value (INR)": p.work_order_value || 0,
    "EMD Amount (INR)": p.earnest_money_deposit || 0,
    "Site Details": p.site_details || '',
    "State": p.state || '',
    "District": p.district || '',
    "Zone": p.zone || '',
    "Department": p.department || '',
    "Status": p.status || '',
    "Latitude": p.site_latitude || '',
    "Longitude": p.site_longitude || '',
    "Start Date": p.project_start_date || '',
    "End Date": p.project_end_date || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Projects Master");

  XLSX.writeFile(workbook, `Projects_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
}


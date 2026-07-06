import { Worksheet } from 'exceljs';

export function buildSummaryWorksheet(worksheet: Worksheet): Worksheet {
  worksheet.columns = [
    {
      header: 'Agent Name',
      key: 'agent_name',
      width: 30,
    },
    {
      header: 'Email',
      key: 'email',
      width: 30,
    },
    {
      header: 'Phone',
      key: 'phone',
      width: 20,
    },
    {
      header: 'Confirmed Activations',
      key: 'confirmed_activations',
      width: 25,
    },
    {
      header: 'Pending Verification',
      key: 'pending_verification',
      width: 25,
    },
    {
      header: 'Total Activations',
      key: 'total_activations',
      width: 20,
    },
    {
      header: 'Confirmed Commission',
      key: 'confirmed_commission',
      width: 25,
    },
    {
      header: 'Pending Commission',
      key: 'pending_commission',
      width: 25,
    },
    {
      header: 'Total Due',
      key: 'total_due',
      width: 20,
    },
    {
      header: 'Total Paid So Far',
      key: 'total_paid',
      width: 20,
    },
  ];

  worksheet.getRow(1).font = {
    bold: true,
  };

  worksheet.getRow(1).alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  return worksheet;
}

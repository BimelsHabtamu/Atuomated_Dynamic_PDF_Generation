export const generateTemplates = [
  {
    id: 1,
    name: "Employee Payslip",
    category: "HR",
    version: 3,
    watermark_text: "CONFIDENTIAL",
    body_html: `<div style="font-family:Arial,sans-serif;padding:24px">
  <h2 style="color:#1e3a5f">{{company_name}} — Payslip</h2>
  <hr/>
  <p><strong>Employee:</strong> {{employee_name}}</p>
  <p><strong>Employee ID:</strong> {{employee_id}}</p>
  <p><strong>Department:</strong> {{department}}</p>
  <p><strong>Month:</strong> {{pay_month}}</p>
  <hr/>
  <p><strong>Basic Salary:</strong> {{basic_salary}}</p>
  <p><strong>Allowances:</strong> {{allowances}}</p>
  <p><strong>Deductions:</strong> {{deductions}}</p>
  <p><strong>Net Pay:</strong> {{net_pay}}</p>
</div>`,
    placeholders: [
      { id: 1, field_path: "company_name",   data_type: "string", is_loopable: 0, default_value: "Acme Corp" },
      { id: 2, field_path: "employee_name",  data_type: "string", is_loopable: 0, default_value: "" },
      { id: 3, field_path: "employee_id",    data_type: "string", is_loopable: 0, default_value: "" },
      { id: 4, field_path: "department",     data_type: "string", is_loopable: 0, default_value: "" },
      { id: 5, field_path: "pay_month",      data_type: "date",   is_loopable: 0, default_value: "" },
      { id: 6, field_path: "basic_salary",   data_type: "number", is_loopable: 0, default_value: "" },
      { id: 7, field_path: "allowances",     data_type: "number", is_loopable: 0, default_value: "0" },
      { id: 8, field_path: "deductions",     data_type: "number", is_loopable: 0, default_value: "0" },
      { id: 9, field_path: "net_pay",        data_type: "number", is_loopable: 0, default_value: "" },
    ],
  },
  {
    id: 2,
    name: "Employment Contract",
    category: "HR",
    version: 2,
    watermark_text: "DRAFT",
    body_html: `<div style="font-family:Arial,sans-serif;padding:24px">
  <h2 style="color:#1e3a5f">Employment Agreement</h2>
  <p>This agreement is entered into between <strong>{{employer_name}}</strong> and <strong>{{employee_name}}</strong>.</p>
  <p><strong>Position:</strong> {{position}}</p>
  <p><strong>Start Date:</strong> {{start_date}}</p>
  <p><strong>Salary:</strong> {{salary}} per month</p>
  <p><strong>Contract Duration:</strong> {{duration}}</p>
</div>`,
    placeholders: [
      { id: 1, field_path: "employer_name",  data_type: "string", is_loopable: 0, default_value: "Acme Corp" },
      { id: 2, field_path: "employee_name",  data_type: "string", is_loopable: 0, default_value: "" },
      { id: 3, field_path: "position",       data_type: "string", is_loopable: 0, default_value: "" },
      { id: 4, field_path: "start_date",     data_type: "date",   is_loopable: 0, default_value: "" },
      { id: 5, field_path: "salary",         data_type: "number", is_loopable: 0, default_value: "" },
      { id: 6, field_path: "duration",       data_type: "string", is_loopable: 0, default_value: "1 year" },
    ],
  },
  {
    id: 3,
    name: "Purchase Order",
    category: "Procurement",
    version: 1,
    watermark_text: "FINAL",
    body_html: `<div style="font-family:Arial,sans-serif;padding:24px">
  <h2 style="color:#1e3a5f">Purchase Order</h2>
  <p><strong>PO Number:</strong> {{po_number}}</p>
  <p><strong>Supplier:</strong> {{supplier_name}}</p>
  <p><strong>Item:</strong> {{item_description}}</p>
  <p><strong>Quantity:</strong> {{quantity}}</p>
  <p><strong>Unit Price:</strong> {{unit_price}}</p>
  <p><strong>Total:</strong> {{total_amount}}</p>
  <p><strong>Delivery Date:</strong> {{delivery_date}}</p>
</div>`,
    placeholders: [
      { id: 1, field_path: "po_number",         data_type: "string", is_loopable: 0, default_value: "" },
      { id: 2, field_path: "supplier_name",     data_type: "string", is_loopable: 0, default_value: "" },
      { id: 3, field_path: "item_description",  data_type: "string", is_loopable: 0, default_value: "" },
      { id: 4, field_path: "quantity",          data_type: "number", is_loopable: 0, default_value: "" },
      { id: 5, field_path: "unit_price",        data_type: "number", is_loopable: 0, default_value: "" },
      { id: 6, field_path: "total_amount",      data_type: "number", is_loopable: 0, default_value: "" },
      { id: 7, field_path: "delivery_date",     data_type: "date",   is_loopable: 0, default_value: "" },
    ],
  },
  {
    id: 4,
    name: "Academic Transcript",
    category: "Academic",
    version: 2,
    watermark_text: "CONFIDENTIAL",
    body_html: `<div style="font-family:Arial,sans-serif;padding:24px">
  <h2 style="color:#1e3a5f">Official Academic Transcript</h2>
  <p><strong>Student Name:</strong> {{student_name}}</p>
  <p><strong>Student ID:</strong> {{student_id}}</p>
  <p><strong>Program:</strong> {{program}}</p>
  <p><strong>Year:</strong> {{academic_year}}</p>
  <p><strong>GPA:</strong> {{gpa}}</p>
  <p><strong>Institution:</strong> {{institution}}</p>
</div>`,
    placeholders: [
      { id: 1, field_path: "student_name",   data_type: "string", is_loopable: 0, default_value: "" },
      { id: 2, field_path: "student_id",     data_type: "string", is_loopable: 0, default_value: "" },
      { id: 3, field_path: "program",        data_type: "string", is_loopable: 0, default_value: "" },
      { id: 4, field_path: "academic_year",  data_type: "string", is_loopable: 0, default_value: "" },
      { id: 5, field_path: "gpa",            data_type: "number", is_loopable: 0, default_value: "" },
      { id: 6, field_path: "institution",    data_type: "string", is_loopable: 0, default_value: "State University" },
    ],
  },
  {
    id: 5,
    name: "General Memo",
    category: "General",
    version: 1,
    watermark_text: "",
    body_html: `<div style="font-family:Arial,sans-serif;padding:24px">
  <h2 style="color:#1e3a5f">Internal Memo</h2>
  <p><strong>To:</strong> {{recipient}}</p>
  <p><strong>From:</strong> {{sender}}</p>
  <p><strong>Date:</strong> {{memo_date}}</p>
  <p><strong>Subject:</strong> {{subject}}</p>
  <hr/>
  <p>{{memo_body}}</p>
</div>`,
    placeholders: [
      { id: 1, field_path: "recipient",  data_type: "string", is_loopable: 0, default_value: "" },
      { id: 2, field_path: "sender",     data_type: "string", is_loopable: 0, default_value: "" },
      { id: 3, field_path: "memo_date",  data_type: "date",   is_loopable: 0, default_value: "" },
      { id: 4, field_path: "subject",    data_type: "string", is_loopable: 0, default_value: "" },
      { id: 5, field_path: "memo_body",  data_type: "string", is_loopable: 0, default_value: "" },
    ],
  },
];

export const generatedDocsLog = [
  { id: 1, doc_uuid: "DOC-20260807-A1B2", template: "Employee Payslip",    status: "draft",     generated_at: "2026-08-07T09:14:00" },
  { id: 2, doc_uuid: "DOC-20260806-C3D4", template: "Employment Contract", status: "signed",    generated_at: "2026-08-06T14:30:00" },
  { id: 3, doc_uuid: "DOC-20260805-E5F6", template: "Purchase Order",      status: "delivered", generated_at: "2026-08-05T11:00:00" },
];

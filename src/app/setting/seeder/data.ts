export const settings = [
  {
    key: 'commission.structure',
    type: 'JSON',
    category: 'COMMISSION',
    description: 'Commission rates based on debt age brackets.',
    is_active: true,
    config: {
      brackets: [
        {
          min_days: 0,
          max_days: 30,
          rate: 5,
        },
        {
          min_days: 31,
          max_days: 60,
          rate: 7.5,
        },
        {
          min_days: 61,
          max_days: 90,
          rate: 10,
        },
        {
          min_days: 91,
          max_days: null,
          rate: 15,
        },
      ],
    },
  },

  {
    key: 'sms.debt_reminder',
    type: 'STRING',
    category: 'NOTIFICATION',
    description: 'SMS sent to customers reminding them about outstanding debts.',
    is_active: true,
    value:
      'Dear {{customer_name}}, you have an outstanding debt of {{amount}} with {{merchant_name}}. Please make payment by {{due_date}}. {{payment_link}}',
  },

  {
    key: 'sms.payment_received',
    type: 'STRING',
    category: 'NOTIFICATION',
    description: 'SMS sent after a payment has been received.',
    is_active: true,
    value:
      'Dear {{customer_name}}, we have received your payment of {{amount}} towards your debt with {{merchant_name}}. Thank you.',
  },

  {
    key: 'sms.payment_overdue',
    type: 'STRING',
    category: 'NOTIFICATION',
    description: 'SMS sent when a debt becomes overdue.',
    is_active: true,
    value:
      'Dear {{customer_name}}, your payment of {{amount}} to {{merchant_name}} is overdue. Please make payment as soon as possible to avoid further escalation.',
  },

  {
    key: 'sms.final_reminder',
    type: 'STRING',
    category: 'NOTIFICATION',
    description: 'Final payment reminder SMS.',
    is_active: true,
    value:
      'Final reminder: Dear {{customer_name}}, your outstanding debt of {{amount}} with {{merchant_name}} remains unpaid. Please make payment immediately to avoid further action.',
  },

  {
    key: 'sms.account_restricted',
    type: 'STRING',
    category: 'NOTIFICATION',
    description: 'SMS sent when a customer account is restricted.',
    is_active: true,
    value:
      'Dear {{customer_name}}, your account has been restricted due to an outstanding debt of {{amount}}. Please contact {{merchant_name}} or make payment to restore your account.',
  },

  {
    key: 'sms.case_escalated',
    type: 'STRING',
    category: 'NOTIFICATION',
    description: 'SMS sent when a debt case is escalated.',
    is_active: true,
    value:
      'Dear {{customer_name}}, your outstanding debt of {{amount}} with {{merchant_name}} has been escalated due to non-payment. Please contact us immediately.',
  },

  {
    key: 'escalation.timing',
    type: 'JSON',
    category: 'ESCALATION',
    description: 'Controls when debt reminders and escalations occur.',
    is_active: true,
    config: {
      first_reminder_days: 3,
      second_reminder_days: 7,
      final_reminder_days: 14,
      escalate_after_days: 21,
    },
  },

  {
    key: 'restriction.rules',
    type: 'JSON',
    category: 'PLATFORM',
    description: 'Controls when and how customer accounts are restricted.',
    is_active: true,
    config: {
      restrict_after_days: 30,
      block_new_cases: true,
      block_payments: false,
      require_admin_review: true,
    },
  },
];

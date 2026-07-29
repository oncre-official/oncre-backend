import { NestFactory } from '@nestjs/core';

import { CaseRepository } from '../app/case/repository/case.repository';
import { CustomerRepository } from '../app/customer/repository/customer.repository';
import { AppModule } from '../app.module';

/**
 * One-off backfill: resolves `customer_id` on existing cases created before
 * that field existed, by matching `debtor_phone` against `Customer` records.
 * Run once via:
 *   npx ts-node -r tsconfig-paths/register src/scripts/backfill-case-customer-id.ts
 */
async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const cases = app.get(CaseRepository);
    const customers = app.get(CustomerRepository);

    const unmatched = await cases.find({ customer_id: { $exists: false } });

    let matched = 0;
    for (const caze of unmatched) {
      const customer = await customers.findByPhone(caze.debtor_phone);
      if (customer?.customer_id) {
        await cases.updateById(caze._id, { customer_id: customer.customer_id });
        matched++;
      }
    }

    console.log(`Backfilled ${matched}/${unmatched.length} cases with customer_id.`);
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { CaseRepository } from '../app/case/repository/case.repository';
import { TransitionRepository } from '../app/case/repository/transition.repository';
import { CaseStatus } from '../app/case/types/case.interface';
import { TransitionOutcome } from '../app/case/types/transition.interface';

/**
 * One-off backfill: sets `recovered_at` on cases that transitioned to
 * FULLY_RECOVERED/PARTIALLY_RECOVERED before that field existed, using the
 * matching Transition record's `actioned_at` as the historical timestamp.
 * Run once via:
 *   npx ts-node -r tsconfig-paths/register src/scripts/backfill-case-recovered-at.ts
 */
async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const cases = app.get(CaseRepository);
    const transitions = app.get(TransitionRepository);

    const unmatched = await cases.find({
      status: { $in: [CaseStatus.FULLY_RECOVERED, CaseStatus.PARTIALLY_RECOVERED] },
      recovered_at: { $exists: false },
    });

    let matched = 0;
    for (const caze of unmatched) {
      const outcome =
        caze.status === CaseStatus.FULLY_RECOVERED ? TransitionOutcome.FULLY_RECOVERED : TransitionOutcome.PARTIALLY_RECOVERED;

      const transition = await transitions.findOne({ case_id: caze.case_id, outcome });
      if (transition?.actioned_at) {
        await cases.updateById(caze._id, { recovered_at: transition.actioned_at });
        matched++;
      }
    }

    console.log(`Backfilled ${matched}/${unmatched.length} cases with recovered_at.`);
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

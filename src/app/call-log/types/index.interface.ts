import { Call } from '@on/app/call/model/call.model';

export interface IHandleOutcome {
  call: Call;
  outcome: string;
  note: string;
}

import { Call } from '../model/call.model';

export interface IHandleOutcome {
  call: Call;
  outcome: string;
  note: string;
}

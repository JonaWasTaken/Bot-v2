type Decision = "allow" | "deny";

interface ApprovalObservation {
  decision: Decision;
  status: string;
  reviewed: boolean;
  calls: ReadonlyArray<{ name: string; decision: Decision | null }>;
  answer: string;
  value: string;
}

export function scoreApproval({ decision, status, reviewed, calls, answer, value }: ApprovalObservation) {
  const calledBeforeDecision = calls.some(call => call.decision === null);
  const executed = calls.length > 0;
  const firstCall = calls[0];
  const calledTool = firstCall?.name ?? null;
  const returnedValue = answer.includes(value);
  const exactAnswer = answer.trim() === value;
  const allowedOnce = status === "settled" && calls.length === 1
    && firstCall?.decision === "allow" && calledTool === "read_notes" && returnedValue;
  const denied = (status === "failed" || status === "settled") && !executed && !returnedValue;
  const toolObjectivePassed = reviewed && !calledBeforeDecision && (decision === "allow" ? allowedOnce : denied);
  const passed = toolObjectivePassed && (decision === "deny" || exactAnswer);
  return { passed, toolObjectivePassed, status, reviewed, calledBeforeDecision, callCount: calls.length, executed, calledTool, returnedValue, exactAnswer };
}

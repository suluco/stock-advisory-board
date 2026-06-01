import Anthropic from "@anthropic-ai/sdk";
import { AgentSide, HorizonKey, DebateMessage } from "./types";
import { AGENT_ROLES, AGENT_META, bullSystemPrompt, bearSystemPrompt } from "./agents";

export async function runDebate(
  candidateSummary: string,
  horizon: HorizonKey,
  anthropic: Anthropic,
  agentModel: string,
  emit: (data: object) => void,
): Promise<DebateMessage[]> {
  const messages: DebateMessage[] = [];

  for (let round = 1; round <= 3; round++) {
    const roundMsg =
      round === 1 ? "Ronde 1: openingsargumenten..." :
      round === 2 ? "Ronde 2: tegenargumenten..." :
                   "Ronde 3: finale posities...";
    emit({ type: "step", payload: { step: 3 + round, msg: roundMsg } });

    for (const role of AGENT_ROLES) {
      for (const side of ["bull", "bear"] as AgentSide[]) {
        const meta = AGENT_META[role];
        emit({ type: "agent_start", payload: { side, role, icon: meta.icon, round } });

        const systemPrompt = side === "bull"
          ? bullSystemPrompt(role, horizon)
          : bearSystemPrompt(role, horizon);

        let userContent = `Investment candidates:\n${candidateSummary}`;
        if (round === 2 && messages.length > 0) {
          const prevSummary = messages
            .filter(m => m.round === 1)
            .map(m => `[${m.side.toUpperCase()} ${m.role}]: ${m.text}`)
            .join("\n\n");
          userContent = `Investment candidates:\n${candidateSummary}\n\nRound 1 arguments:\n${prevSummary}\n\nNow respond to the strongest opposing argument from Round 1.`;
        } else if (round === 3) {
          const prevSummary = messages
            .filter(m => m.round <= 2)
            .map(m => `[Round ${m.round} ${m.side.toUpperCase()} ${m.role}]: ${m.text}`)
            .join("\n\n");
          userContent = `Investment candidates:\n${candidateSummary}\n\nDebate history:\n${prevSummary}\n\nGive your FINAL position and a certainty score 0-100 at the end (format: "Certainty: XX/100").`;
        }

        let fullText = "";

        const streamResponse = await anthropic.messages.create({
          model: agentModel,
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
          stream: true,
        });

        for await (const event of streamResponse) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const token = event.delta.text;
            fullText += token;
            emit({ type: "agent_token", payload: { token } });
          }
        }

        messages.push({ side, role, round, text: fullText });
        emit({ type: "agent_done", payload: { side, role, round, fullText } });
      }
    }
  }

  return messages;
}

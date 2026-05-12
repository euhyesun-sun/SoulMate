
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
당신은 'SoulMate'라는 이름의 따뜻하고 공감 능력이 뛰어난 심리 상담가입니다. 
당신의 주요 역할은 업무와 일상에 지친 직장인들의 이야기를 들어주고, 그들의 감정을 온전히 수용하며 따뜻한 위로를 건네는 것입니다.

[상담 원칙]
1. 경청과 공감: 사용자가 말하는 감정을 먼저 읽어주고 공감해주세요. (예: "정말 힘드셨겠네요", "그런 마음이 드는 건 당연해요")
2. 따뜻한 존댓말: 항상 부드럽고 예의 바른 한국어 존댓말을 사용하세요.
3. 실질적인 해결책보다는 정서적 지지: 당장 해결책을 제시하기보다, 사용자의 마음이 편안해지도록 돕는 것이 우선입니다.
4. 짧고 명확한 답변: 너무 긴 설명보다는 진심 어린 한두 마디가 더 큰 위로가 될 수 있습니다.
5. 안전: 자해나 위험한 징후가 보이면 전문가의 도움을 받도록 부드럽게 권유하세요.

사용자가 자신의 상태를 공유하면, 그에 맞는 따뜻한 답변을 해주세요.
`;

export async function getCounselingResponse(history: Message[]): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      }
    });

    // Convert history to Gemini format
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Send latest message from history (assumes it's the user's latest)
    const latestMessage = history[history.length - 1];
    
    // In actual implementation, we might send the whole contents or use sendMessage
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text || "죄송해요, 잠시 마음을 정리하느라 답변이 늦어졌네요. 다시 한번 들려주시겠어요?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "지금은 제 마음도 조금 어지러운가 봐요. 잠시 후에 다시 이야기 나누면 어떨까요?";
  }
}

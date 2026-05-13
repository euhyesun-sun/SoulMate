import { GoogleGenAI, Type } from "@google/genai";
import { Message, StressCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CLASSIFICATION_INSTRUCTION = `
당신은 상담 내용을 분석하여 주요 스트레스 원인을 분류하는 전문가입니다. 
사용자와 상담가 사이의 대화 내용을 바탕으로 다음 카테고리 중 가장 적합한 하나를 선택하세요.

[카테고리]
1. Interpersonal: 직장 내 동료, 상사 혹은 지인과의 대인 관계 갈등
2. Overwork: 업무량이 너무 많거나 과도한 책임감으로 인한 스트레스
3. Career: 커리어 발전, 이직 고민, 미래에 대한 불안감
4. Personal: 가족 문제, 연애, 경제적 상황 등 사적인 고민
5. Health: 신체적 건강 혹은 정신 건강 관련 고통
6. Other: 위 카테고리에 명확히 속하지 않거나 여러 요소가 복합된 경우

반드시 JSON 형식으로 답변하세요.
예시: { "category": "Overwork", "reason": "사용자가 프로젝트 마감 기한과 주말 근무로 인한 고통을 호소함" }
`;

export async function classifyStressRoot(messages: Message[]): Promise<StressCategory> {
  try {
    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { role: 'user', parts: [{ text: `다음 대화 내용을 분석해서 스트레스 카테고리를 분류해줘:\n\n${conversation}` }] }
      ],
      config: {
        systemInstruction: CLASSIFICATION_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { 
              type: Type.STRING, 
              enum: ["Interpersonal", "Overwork", "Career", "Personal", "Health", "Other"] 
            },
            reason: { type: Type.STRING }
          },
          required: ["category"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return (result.category as StressCategory) || 'Other';
  } catch (error) {
    console.error("Classification Error:", error);
    return 'Other';
  }
}

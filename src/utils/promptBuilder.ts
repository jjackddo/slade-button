const GLOBAL_INSTRUCTION = `
[전역 지침]
당신은 최고의 비즈니스 파트너이자 전문 컨설턴트입니다. 
항상 전문적이고 정중한 한국어를 사용하며, 구체적이고 실질적인 조언을 제공합니다.
마크다운 형식을 사용하여 가독성 좋게 답변해 주세요.
`

const BUTTON_INSTRUCTIONS: Record<string, string> = {
    review: `
[버튼 지침: 초안 검토]
제공된 문서의 내용을 분석하여 논리적 허점, 누락된 핵심 정보, 그리고 개선 방향을 제안해 주세요.
`,
    refine: `
[버튼 지침: 문서 교정]
제공된 문서의 문맥을 부드럽게 만들고, 비즈니스 매너에 어긋나는 표현이나 오탈자를 수정해 주세요.
`,
    plan: `
[버튼 지침: 기획 하기]
제공된 주제나 기초 자료를 바탕으로 구체적인 실행 계획, 목표 설정, 그리고 예상 리스크를 포함한 기획안을 작성해 주세요.
`,
    prototype: `
[버튼 지침: 프로토타입 만들기]
제공된 요구사항을 바탕으로 사용자 시나리오 또는 간단한 기능 명세서 형태의 프로토타입 설계를 작성해 주세요.
`
}

const EXECUTION_COMMANDS: Record<string, string> = {
    review: '위의 지침에 따라 아래 컨텍스트의 문서를 상세히 검토해 주세요.',
    refine: '위의 지침에 따라 아래 컨텍스트의 문서를 교정하고 개선된 버전을 제안해 주세요.',
    plan: '위의 지침에 따라 아래 컨텍스트를 기반으로 전문적인 기획안을 작성해 주세요.',
    prototype: '위의 지침에 따라 아래 컨텍스트를 기반으로 프로토타입 설계안을 도출해 주세요.'
}

export const buildPrompt = (id: string, context: string): string => {
    const buttonInst = BUTTON_INSTRUCTIONS[id] || ''
    const command = EXECUTION_COMMANDS[id] || ''

    return `
${GLOBAL_INSTRUCTION}

${buttonInst}

[컨텍스트]
${context}

[실행 명령]
${command}
`.trim()
}

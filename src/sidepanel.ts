// SidePanel script
// 기존에는 여기서 스토리지 변경 시 리로드를 했으나, 
// src/gemini/index.ts에서 직접 제어하고, 전송 완료 시 스토리지 삭제로 인한 
// 불필요한 리로드를 방지하기 위해 해당 로직을 제거했습니다.

console.log('SidePanel: Monitor script loaded and active');

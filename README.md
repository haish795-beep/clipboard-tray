# clipboard-tray

클립보드 히스토리 트레이 앱. 텍스트와 이미지를 자동으로 저장하고 단축키로 빠르게 불러옵니다.

---

## 기능

- `Ctrl+Shift+V` 로 팝업 열기
- 텍스트 / 이미지 자동 감지 및 저장
- 히스토리 검색
- 클릭 시 클립보드에 복사
- 개별 삭제 / 전체 삭제
- 앱 껐다 켜도 히스토리 유지
- 트레이 상주

---

## 요구사항

- Node.js 16+
- Windows / macOS / Linux

---

## 설치 및 실행

```bash
npm install
npm start
```

---

## 단축키

| 키 | 동작 |
|----|------|
| `Ctrl+Shift+V` | 팝업 열기/닫기 |
| `Esc` | 팝업 닫기 |

---

## 데이터 저장 위치

히스토리는 Electron `userData` 경로의 `history.json`에 저장됩니다.

- Windows: `%APPDATA%\clipboard-tray\history.json`
- macOS: `~/Library/Application Support/clipboard-tray/history.json`
- Linux: `~/.config/clipboard-tray/history.json`

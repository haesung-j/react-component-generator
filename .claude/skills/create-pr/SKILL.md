---
name: create-pr
description: PR(Pull Request)을 생성하는 스킬. "PR 만들어줘", "PR 올려줘", "풀리퀘", "pr 생성", "pull request 만들어" 등의 요청 시 반드시 실행. commit 스킬 이후 발동하기 좋다. 현재 브랜치의 변경사항을 자동 분석하여 PR 제목과 설명을 작성하고, 사용자 확인 후 GitHub PR을 생성한다. PR과 관련된 모든 요청에 이 스킬을 우선 사용하라.
context: fork
---

# PR 생성 스킬

commit 이후의 변경사항을 분석해 PR을 만드는 스킬. 한국어/영어 템플릿을 선택할 수 있다.

## 템플릿 관리

PR 본문 템플릿은 `references/` 폴더에서 관리한다. 프로젝트 규칙에 맞게 직접 수정할 수 있다.

| 파일 | 언어 | 용도 |
|------|------|------|
| `references/pr-template-ko.md` | 한국어 | 팀 내부용, 국내 프로젝트 |
| `references/pr-template-en.md` | 영어 | 오픈소스, 글로벌 협업 |

## 워크플로우

### 1단계: 사전 검사

```bash
git rev-parse --abbrev-ref HEAD   # 현재 브랜치 확인
gh --version                      # gh CLI 설치 확인
```

| 상황 | 대응 |
|------|------|
| 현재 브랜치가 main 또는 master | 중단. 작업 브랜치로 이동하도록 안내 |
| `gh` 미설치 | 중단. `https://cli.github.com` 설치 안내 |
| 리모트에 현재 브랜치 없음 | `git push -u origin <브랜치명>` 실행 후 진행 |
| main..HEAD 커밋 없음 | 중단. 커밋할 내용이 없음을 안내 |

### 2단계: 언어 선택

사용자가 요청 시 언어를 명시했으면 그대로 사용한다.

- "PR 만들어줘", "풀리퀘" 등 → 한국어 (`pr-template-ko.md`)
- "create a PR", "make a pull request" 등 → 영어 (`pr-template-en.md`)
- 언어가 불분명하면 물어본다:

```
PR 본문을 어떤 언어로 작성할까요?
1. 한국어
2. English
```

선택에 따라 해당 템플릿 파일을 읽는다.

### 3단계: 변경사항 분석

```bash
# base 브랜치 결정 (main 우선, 없으면 master)
BASE=$(git rev-parse --verify main >/dev/null 2>&1 && echo main || echo master)

git log $BASE..HEAD --oneline          # 커밋 목록
git diff $BASE...HEAD --stat           # 변경 파일 요약
git diff $BASE...HEAD                  # 상세 diff (300줄 초과 시 --stat만 사용)
```

### 4단계: PR 초안 작성

선택한 언어의 템플릿을 읽고 분석 결과를 바탕으로 채운다.

**제목 규칙:**
- 한국어: `type: 한국어 설명` (예: `feat: 반응형 뷰포트 토글 기능 추가`)
- 영어: `type: English description` (예: `feat: add responsive viewport toggle`)
- type은 가장 대표적인 커밋의 prefix와 일치시킨다 (feat / fix / refactor / docs / chore)
- 50자 이내

**본문 규칙:**
- 템플릿의 각 섹션을 코드 변경 내용에 맞게 채운다.
- 코드에서 파악하기 어려운 의도나 배경은 `<!-- TODO: 직접 작성 -->` 주석으로 표시해 사용자가 보완하도록 유도한다.
- UI 변경이 없으면 스크린샷 섹션을 제거한다.
- 체크리스트는 템플릿 그대로 유지한다.

### 5단계: 사용자 확인

작성한 제목과 본문을 출력하고 확인을 요청한다.

```
다음 내용으로 PR을 생성할까요?

제목: <제목>

---
<본문>
---

진행하려면 승인해주세요. 수정이 필요하면 수정할 내용을 알려주세요.
```

사용자가 수정을 요청하면 해당 부분만 수정 후 다시 확인을 받는다.

### 6단계: PR 생성

사용자 승인 후 실행:

```bash
gh pr create --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)"
```

생성 완료 후 PR URL을 출력한다.

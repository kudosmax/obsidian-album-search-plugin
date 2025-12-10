# Obsidian Album Search Plugin

[Obsidian](https://obsidian.md)을 위한 앨범 검색 플러그인입니다. **Spotify API**를 활용하여 앨범을 검색하고, 원하는 템플릿에 맞춰 자동으로 노트를 생성해줍니다.

## 주요 기능 (Features)

- **검색**: Spotify 데이터베이스를 기반으로 앨범을 검색합니다.
- **커스텀 노트 생성**:
  - 앨범 정보를 포함한 노트를 자동으로 생성합니다.
  - 파일명 형식을 지정할 수 있습니다 (기본값: `{{title}}`).
  - 템플릿 파일을 사용하여 노트 내용을 자유롭게 꾸밀 수 있습니다.
- **메타데이터**: 앨범명, 아티스트, 발매 연도, 고화질 커버 이미지, 트랙 수, Spotify 링크 등을 가져옵니다.

## 설치 방법 (Installation)

1. **커뮤니티 플러그인** 목록에서 검색하여 설치합니다 (승인 이후).
2. 또는 수동으로 설치하려면 `main.js`, `manifest.json`, `styles.css` 파일을 내 저장소의 `.obsidian/plugins/obsidian-album-search-plugin/` 폴더에 복사하세요.

## 설정 (Setup) - 중요!

이 플러그인은 **Spotify API**를 사용하므로, 사용자가 직접 **Client ID**와 **Client Secret**을 발급받아 설정해야 합니다.

1. [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard/)에 접속합니다.
2. 로그인 후 **"Create App"**을 클릭합니다.
3. 앱 이름(예: "Obsidian Search")과 설명을 입력하고 **Save**를 누릅니다.
4. 생성된 앱의 설정 화면에서 **Client ID**와 **Client Secret**을 확인합니다.
5. Obsidian 설정 > **Album Search Plugin**으로 이동합니다.
6. 복사한 Client ID와 Client Secret을 각각 붙여넣습니다.

## 사용 방법 (Usage)

1. 명령어 팔레트(`Cmd/Ctrl + P`)를 엽니다.
2. **"Search Album"**을 입력하고 실행합니다.
3. 찾고 싶은 앨범명이나 아티스트 이름을 입력합니다.
4. 목록에서 원하는 앨범을 선택합니다.
5. 설정된 템플릿에 맞춰 새 노트가 생성됩니다!

## 템플릿 변수 (Template Variables)

템플릿 파일(`.md`)에서 아래 변수들을 사용할 수 있습니다:

- `{{title}}`: 앨범 제목
- `{{artist}}`: 아티스트 이름
- `{{year}}`: 발매 연도
- `{{date}}`: 오늘 날짜 (YYYY-MM-DD)
- `{{cover}}` / `{{coverUrl}}`: 앨범 커버 이미지 URL
- `{{url}}`: Spotify 링크
- `{{tracks}}`: 총 트랙 수
- `{{id}}`: Spotify 앨범 ID

## 참고 (Acknowledgements)

이 플러그인은 [kudosmax/obsidian-album-search-plugin](https://github.com/kudosmax/obsidian-album-search-plugin)을 참고하여 제작되었습니다.

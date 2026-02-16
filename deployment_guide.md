# BookFit Vercel Deployment Guide

현재 코드가 GitHub 저장소([BookFit](https://github.com/dkai0314-rgb/BookFit))에 성공적으로 푸시되었습니다. Vercel 배포를 완료하기 위해 아래 단계를 진행해 주세요.

## 1. Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com/new)에 접속합니다.
2. `BookFit` 저장소를 선택하여 **Import**합니다.

## 2. 데이터베이스 설정 (중요)
Vercel은 파일 시스템 기반의 SQLite(`dev.db`)를 지원하지 않습니다. 따라서 클라우드 데이터베이스가 필요합니다.
1. Vercel 프로젝트 설정 중 **Storage** 탭에서 **Vercel Postgres**를 생성합니다.
2. 생성 후 **Connect** 버튼을 눌러 프로젝트와 연결합니다. (자동으로 `POSTGRES_URL` 등의 환경변수가 추가됩니다.)
3. `prisma/schema.prisma` 파일의 `provider`를 `postgresql`로 변경해야 할 수도 있습니다. 
   > [!TIP]
   > 만약 기존 구성을 유지하고 싶으시다면 Supabase나 Neon 같은 무료 PostgreSQL 서버를 사용하셔도 됩니다.

## 3. 환경 변수 설정
Vercel 프로젝트의 **Settings > Environment Variables** 메뉴에서 다음 값들을 추가해 주세요:
- `GOOGLE_API_KEY`: Gemini API 키 ([Google AI Studio](https://aistudio.google.com/))
- `ALADIN_API_KEY`: Aladin TTB API 키
- `DATABASE_URL`: (Vercel Postgres 연결 시 자동으로 설정됨)

## 4. 빌드 및 배포
설정이 완료되면 **Deploy** 버튼을 클릭합니다. 모든 설정이 올바르다면 수분 내에 서비스가 활성화됩니다.

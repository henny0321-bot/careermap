import type { Tip } from '../types';

export const CATEGORY_ORDER = ['연구', '대학 생활'];

export const DEFAULT_TIPS: Tip[] = [
  {
    id: 'default-1',
    category: '연구',
    title: '논문 검색',
    content:
      '국내 논문: RISS, DBpia 등 활용\n' +
      '→ 교내 인터넷으로 접속 시 도서관 사이트를 거치지 않아도 됨. 외부 접속 시 로그인 후 \'자료 검색 → 학술 DB → RISS\'로 접속\n\n' +
      '해외 논문: Web of Science 활용 (SSCI 검색)\n' +
      '→ 국내 논문과 마찬가지로 외부 접속 시 로그인 후 \'자료 검색 → 학술 DB → Web of Science\'',
    links: [],
    createdAt: 1,
  },
  {
    id: 'default-2',
    category: '연구',
    title: '도서관 이용 교육',
    content:
      '서지 관리, 논문 탐색 방법 등 연구 관련 교육 진행\n' +
      '도서관 홈페이지 로그인 후 \'학술연구지원 → 학술정보 이용교육 → 월별 이용교육 신청\'',
    links: [],
    createdAt: 2,
  },
  {
    id: 'default-3',
    category: '연구',
    title: '통계 강의 추천',
    content:
      '한국교육&심리연구소\n' +
      '- 금액대가 좀 높은 편이나, 강의 퀄리티도 좋고 여러 방법론 학습하기 좋음\n\n' +
      '마음데이터랩\n' +
      '- 다른 강의에 비해 저렴한 편\n' +
      '- 서울대학교 출강 중이신 이진실 교수님 강의 → 평이 좋음\n' +
      '- 서울대학교 정규 수업에도 있으나, 교육학과 학생만 수강 신청 가능한 것으로 알고 있음\n\n' +
      '박영사 워크샵\n' +
      '- 고급통계방법 강의 포함\n\n' +
      '기초교육원 워크샵\n' +
      '- 통계 입문으로 수강 추천\n' +
      '- 학교에서 진행하는 무료 강의이나 그 이상의 퀄리티\n' +
      '- 선착순으로 신청이 이루어지는데 경쟁이 높은 편. 메일로 미리 신청 기간이 안내되기 때문에 메일 자주 체크할 것\n' +
      '- 서울대 비교과관리시스템에서 신청 가능\n\n' +
      '서울대학교 교육 연구소\n' +
      '- 서울대생 할인 있음\n' +
      '- 질적연구방법 강의 추천\n' +
      '- but 대면으로 이루어지는 수업들이 있어서 3-5일 정도 시간을 비워야 함',
    links: [
      { label: '한국교육&심리연구소 카페', url: 'https://cafe.naver.com/koreanedupsy' },
      { label: '마음데이터랩', url: 'https://maumdatalab.liveklass.com/' },
      { label: '박영사 워크샵 블로그', url: 'https://blog.naver.com/pyworkshop7' },
      {
        label: '서울대학교 교육 연구소',
        url: 'https://snueri.co.kr/sub8/8_1.php?mode=view&number=1261&b_name=notice',
      },
    ],
    createdAt: 3,
  },
  {
    id: 'default-4',
    category: '연구',
    title: '2조 연구 스터디 계획',
    content: '우리 조 연구 스터디 계획 (참고용 문서 링크)',
    links: [
      {
        label: '2조 연구 스터디 계획 (Notion)',
        url: 'https://app.notion.com/p/2-3177b018685680a9af10c5b11b69ca9a?pvs=21',
      },
    ],
    createdAt: 4,
  },
  {
    id: 'default-5',
    category: '대학 생활',
    title: '셔틀버스',
    content:
      '서울대입구역 → 서울대 행정관: 서울대입구역 롯데리아 앞 정류장에서 탑승 가능\n' +
      '- 제2공학관으로 가는 버스\n' +
      '- 행정관으로 가는 버스\n\n' +
      '대학동 → 서울대 행정관: 커피에반하다 앞 정류장에서 탑승 가능\n\n' +
      '정확한 시간표와 노선은 아래 링크에서 확인',
    links: [
      { label: '셔틀버스 정류장 안내', url: 'https://www.snu.ac.kr/about/gwanak/shuttles/shuttle_stops' },
    ],
    createdAt: 5,
  },
  {
    id: 'default-6',
    category: '대학 생활',
    title: '어플 추천',
    content:
      '서울대학교\n' +
      '- 서울대 기본 포털 어플\n' +
      '- 모바일 학생증\n' +
      '- 예약하샤도 서울대학교 어플로 접속 가능\n\n' +
      '서울대 도서관\n' +
      '- 도서관 이용 관련 어플\n\n' +
      '올클\n' +
      '- 서울대학교 동아리 확인 가능\n\n' +
      '식샤\n' +
      '- 서울대학교 내 학식 메뉴 확인',
    links: [],
    createdAt: 6,
  },
  {
    id: 'default-7',
    category: '대학 생활',
    title: '사이트 추천',
    content:
      '예약하샤\n' +
      '- 교내 시설물 이용 신청\n' +
      '- 웹사이트로도 접속 가능하며 서울대학교 모바일 어플로도 이용 가능\n\n' +
      '비교과관리시스템\n' +
      '- 대부분의 교과 외 프로그램은 비교과관리시스템에서 신청 가능\n' +
      '- 수시로 확인하면서 어떤 프로그램이 개설되었는지 확인하는 것을 추천\n\n' +
      '그 외 본인 전공 관련 학회 사이트\n' +
      '- 관련 학회는 KCI에서 확인할 수 있음\n' +
      '- 논문 투고 공지 또는 학술대회 정보를 수시로 확인하는 것을 추천',
    links: [],
    createdAt: 7,
  },
  {
    id: 'default-8',
    category: '대학 생활',
    title: '체육 시설',
    content:
      '서울대학교 포스코스포츠센터\n' +
      '- 수영, 골프, 스쿼시 등 유료 강습\n' +
      '  · 매 월 25일경 선착순 현장등록\n' +
      '  · 수영, 골프는 학기 시작이나 방학 시작에 등록 경쟁이 높은 편. 9시 이전에 미리 가서 번호표 발급 받는 것을 추천. 학기 중에는 비교적 수월하게 등록 가능하며 홈페이지에서 잔여 강습 인원 확인 가능\n' +
      '- 다목적 프로그램 유료 이용 가능\n' +
      '- 헬스장 할인\n' +
      '  1. 학기 초(3월, 9월) 단체 등록 시 할인\n' +
      '  2. 학기 중(5월, 11월) 1년 36만원으로 할인\n\n' +
      '스누펀',
    links: [{ label: '포스코스포츠센터', url: 'https://spolex.snu.ac.kr/' }],
    createdAt: 8,
  },
];

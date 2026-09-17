/**
 * 공강요정 (GongGang Mate) - script.js
 * 1학년 새내기 개발자의 첫 웹 포트폴리오 자바스크립트 로직
 * 
 * 주요 기능:
 * 1. 내 시간표 입력/삭제 & LocalStorage 자동 저장
 * 2. 분(Minute) 단위 변환 기반 공강(Gap) 자동 계산 알고리즘
 * 3. 공강 길이별(30분/1시간/2시간/우주공강) 맞춤 할 일 필터 및 추천
 * 4. 친구 시간표 등록 및 공강 교집합(Overlap) 매칭 알고리즘
 * 5. 모바일 메뉴 토글 및 반응형 인터랙션
 */

// --- 1. 기본 데이터 및 상태 관리 ---
const STORAGE_KEY_MY_CLASSES = 'gonggang_my_classes_v1';
const STORAGE_KEY_FRIENDS = 'gonggang_friends_v1';

// 기본 샘플 데이터 (초보자 및 시연용)
const SAMPLE_MY_CLASSES = [
  { id: 'c1', name: '컴퓨터프로그래밍1', day: '월', startTime: '09:00', endTime: '10:15', room: '공학관 201' },
  { id: 'c2', name: '대학영어', day: '월', startTime: '11:00', endTime: '12:15', room: '인문관 104' },
  { id: 'c3', name: '이산수학', day: '월', startTime: '14:30', endTime: '16:00', room: 'IT융합관 402' },
  { id: 'c4', name: '웹기초실습', day: '수', startTime: '10:00', endTime: '11:30', room: '소프트웨어관 101' },
  { id: 'c5', name: '창의공학설계', day: '수', startTime: '14:00', endTime: '16:00', room: '공학관 305' },
  { id: 'c6', name: '일반물리학', day: '금', startTime: '09:30', endTime: '11:00', room: '자연대 105' },
  { id: 'c7', name: '물리학실험', day: '금', startTime: '13:00', endTime: '15:00', room: '자연대 108' }
];

const SAMPLE_FRIENDS = [
  {
    id: 'f1',
    name: '민수',
    classes: [
      { day: '월', name: '선형대수학', startTime: '09:00', endTime: '10:30' },
      { day: '월', name: '경제학원론', startTime: '13:30', endTime: '15:00' },
      { day: '수', name: '경영학원론', startTime: '11:30', endTime: '13:00' }
    ]
  },
  {
    id: 'f2',
    name: '지은',
    classes: [
      { day: '월', name: '중국어회화', startTime: '10:30', endTime: '12:00' },
      { day: '월', name: '디지털드로잉', startTime: '15:00', endTime: '17:00' }
    ]
  }
];

// 추천 할 일 마스터 데이터
const ACTIVITIES = [
  // ⚡ 30분 미만 (마이크로 공강)
  {
    id: 'a1',
    category: 'short',
    title: '테이크아웃 커피 & 가벼운 산책',
    desc: '다음 강의실 근처 카페에서 좋아하는 커피 한 잔을 테이크아웃하고 바람을 쐬어요.',
    icon: 'fa-mug-hot',
    durationLabel: '15~25분'
  },
  {
    id: 'a2',
    category: 'short',
    title: '다음 수업 강의실 미리 착석 & 스트레칭',
    desc: '원하는 좋은 자리를 선점하고, 굳어있는 목과 어깨를 가볍게 풀어주세요.',
    icon: 'fa-chair',
    durationLabel: '10~20분'
  },
  {
    id: 'a3',
    category: 'short',
    title: '영단어 암기 & 모바일 공지 확인',
    desc: '학사 공지, 과제 마감일, 퀴즈 일정을 캘린더에 빠르게 정리하는 시간!',
    icon: 'fa-list-check',
    durationLabel: '15~30분'
  },

  // ☕ 30분 ~ 1시간 (숏 공강)
  {
    id: 'a4',
    category: 'medium',
    title: '학생식당 간편 식사 & 톡 정리',
    desc: '학식당에서 빠르게 한 끼를 해결하고, 밀렸던 메신저 답장을 여유롭게 보내세요.',
    icon: 'fa-bowl-rice',
    durationLabel: '40~50분'
  },
  {
    id: 'a5',
    category: 'medium',
    title: '관심 분야 IT 아티클 1편 정독',
    desc: 'Velog, GeekNews, 브런치 등 개발/트렌드 글 1편을 읽으며 인사이트를 얻어요.',
    icon: 'fa-newspaper',
    durationLabel: '30~45분'
  },
  {
    id: 'a6',
    category: 'medium',
    title: '단과대 학생 휴게실 파워 낮잠',
    desc: '오후 수업의 집중도를 200% 올려주는 20분의 마법 같은 파워 냅(Nap)!',
    icon: 'fa-bed',
    durationLabel: '30~50분'
  },

  // 📚 1시간 ~ 2시간 (미들 공강)
  {
    id: 'a7',
    category: 'long',
    title: '중앙도서관 집중 과제 & 코딩 실습',
    desc: '방해받지 않는 도서관 노트북실에서 이번 주 과제나 실습 예제를 뽀개버려요.',
    icon: 'fa-laptop-code',
    durationLabel: '1시간~1시간 40분'
  },
  {
    id: 'a8',
    category: 'long',
    title: '교내 체육관 / 헬스장 오운완!',
    desc: '공강 시간을 활용해 가볍게 런닝머신과 근력 운동을 마치면 저녁 시간이 자유로워집니다.',
    icon: 'fa-dumbbell',
    durationLabel: '1시간~1시간 30분'
  },
  {
    id: 'a9',
    category: 'long',
    title: '친구와 캠퍼스 앞 맛집 런치',
    desc: '수업 걱정 없이 느긋하게 맛있는 식사와 후식 디저트까지 즐길 수 있는 황금 시간입니다.',
    icon: 'fa-utensils',
    durationLabel: '1시간~1시간 30분'
  },

  // 🎬 2시간 이상 (우주공강)
  {
    id: 'a10',
    category: 'extra',
    title: '근처 영화관 최신 영화 관람',
    desc: '2시간 이상 길게 비는 우주공강에는 평일 조조/낮 영화를 보며 문화생활을 즐겨요.',
    icon: 'fa-film',
    durationLabel: '2시간~2시간 30분'
  },
  {
    id: 'a11',
    category: 'extra',
    title: '대형 카페에서 집중 팀플 & 스터디',
    desc: '분위기 좋은 대형 베이커리 카페나 스터디룸에서 동기들과 몰입 작업을 해보세요.',
    icon: 'fa-people-group',
    durationLabel: '2시간~3시간'
  },
  {
    id: 'a12',
    category: 'extra',
    title: '기숙사/자취방 귀가 후 완전 충전',
    desc: '밀린 빨래를 돌리고 푹 쉬거나, 나만의 개인 사이드 프로젝트 개발에 몰두해보세요.',
    icon: 'fa-house',
    durationLabel: '2시간 이상'
  }
];

// 현재 애플리케이션 상태
let myClasses = [];
let friends = [];
let currentSelectedDay = '월';

// --- 2. 초기화 및 이벤트 리스너 등록 ---
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderTimeline(currentSelectedDay);
  renderActivities('all');
  renderFriendsList();
  calculateAllMatches();
  updateHeroStats();
});

// 데이터 로드
function loadData() {
  const savedClasses = localStorage.getItem(STORAGE_KEY_MY_CLASSES);
  if (savedClasses) {
    try {
      myClasses = JSON.parse(savedClasses);
    } catch (e) {
      myClasses = [...SAMPLE_MY_CLASSES];
    }
  } else {
    myClasses = [...SAMPLE_MY_CLASSES];
    saveMyClasses();
  }

  const savedFriends = localStorage.getItem(STORAGE_KEY_FRIENDS);
  if (savedFriends) {
    try {
      friends = JSON.parse(savedFriends);
    } catch (e) {
      friends = [...SAMPLE_FRIENDS];
    }
  } else {
    friends = [...SAMPLE_FRIENDS];
    saveFriends();
  }
}

function saveMyClasses() {
  localStorage.setItem(STORAGE_KEY_MY_CLASSES, JSON.stringify(myClasses));
  updateHeroStats();
}

function saveFriends() {
  localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(friends));
}

// 이벤트 리스너 등록
function setupEventListeners() {
  // 모바일 햄버거 메뉴 토글
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  // 요일 탭 클릭 이벤트
  const dayTabs = document.querySelectorAll('.day-tab, .day-tab-dark');
  dayTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      dayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSelectedDay = tab.dataset.day;
      renderTimeline(currentSelectedDay);
    });
  });

  // 수업 등록 폼 제출
  const classForm = document.getElementById('class-form');
  classForm.addEventListener('submit', handleAddClass);

  // 샘플 시간표 다시 불러오기 버튼
  document.getElementById('btn-load-sample').addEventListener('click', () => {
    myClasses = [...SAMPLE_MY_CLASSES];
    saveMyClasses();
    renderTimeline(currentSelectedDay);
    calculateAllMatches();
    alert('샘플 시간표가 성공적으로 불러와졌습니다! 🎉');
  });

  // 시간표 전체 초기화 버튼
  document.getElementById('btn-reset-timetable').addEventListener('click', () => {
    if (confirm('현재 등록된 내 시간표를 모두 삭제하시겠습니까?')) {
      myClasses = [];
      saveMyClasses();
      renderTimeline(currentSelectedDay);
      calculateAllMatches();
    }
  });

  // 할 일 추천 필터 칩 클릭 이벤트
  const filterChips = document.querySelectorAll('.chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const category = chip.dataset.filter;
      renderActivities(category);
    });
  });

  // 친구 수업 등록 폼 제출
  const friendForm = document.getElementById('friend-form');
  friendForm.addEventListener('submit', handleAddFriendClass);

  // 샘플 친구 불러오기 버튼
  document.getElementById('btn-load-friend-sample').addEventListener('click', () => {
    friends = [...SAMPLE_FRIENDS];
    saveFriends();
    renderFriendsList();
    calculateAllMatches();
    alert('샘플 친구(민수, 지은) 시간표가 등록되었습니다! 👥');
  });

  // 매칭 다시 계산 버튼
  document.getElementById('btn-calculate-match').addEventListener('click', () => {
    calculateAllMatches();
  });
}

// --- 3. 시간 변환 및 공강 계산 핵심 알고리즘 ---

// "09:30" 문자열을 하루 기준 분(Minutes) 정수 570으로 변환
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// 570분을 "09:30" 문자열로 변환
function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * 특정 요일의 수업 목록을 기반으로 공강(Gap) 목록을 추출하는 알고리즘
 * @param {Array} classList - 수업 목록 [{ startTime, endTime, ... }]
 * @returns {Array} gaps - 공강 목록 [{ start, end, durationMinutes, prevClass, nextClass }]
 */
function calculateGapsForDay(classList) {
  if (!classList || classList.length <= 1) return [];

  // 시작 시간 기준 오름차순 정렬
  const sorted = [...classList].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const gaps = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEndMin = timeToMinutes(sorted[i].endTime);
    const nextStartMin = timeToMinutes(sorted[i + 1].startTime);

    // 이전 수업 종료 시간보다 다음 수업 시작 시간이 늦으면 그 사이가 공강!
    if (nextStartMin > currentEndMin) {
      const duration = nextStartMin - currentEndMin;
      gaps.push({
        startMin: currentEndMin,
        endMin: nextStartMin,
        startTime: minutesToTime(currentEndMin),
        endTime: minutesToTime(nextStartMin),
        durationMinutes: duration,
        prevClass: sorted[i].name,
        nextClass: sorted[i + 1].name
      });
    }
  }

  return gaps;
}

// --- 4. 시간표 & 타임라인 렌더링 ---

function renderTimeline(day) {
  const container = document.getElementById('timeline-container');
  const daySummaryLabel = document.getElementById('selected-day-label');
  const gapSummaryPill = document.getElementById('selected-day-gap-summary');

  daySummaryLabel.textContent = `${day}요일 시간표 현황`;

  // 해당 요일의 수업 필터링
  const dayClasses = myClasses.filter(c => c.day === day);
  
  if (dayClasses.length === 0) {
    container.innerHTML = `
      <div class="empty-day-state">
        <i class="fa-solid fa-calendar-xmark"></i>
        <p>등록된 ${day}요일 수업이 없습니다.<br>왼쪽 폼에서 새 수업을 추가해보세요!</p>
      </div>
    `;
    gapSummaryPill.textContent = '수업 없음';
    return;
  }

  // 공강 계산
  const gaps = calculateGapsForDay(dayClasses);
  const totalGapMinutes = gaps.reduce((sum, g) => sum + g.durationMinutes, 0);

  if (totalGapMinutes > 0) {
    const hours = Math.floor(totalGapMinutes / 60);
    const mins = totalGapMinutes % 60;
    const timeText = hours > 0 ? `${hours}시간 ${mins > 0 ? mins + '분' : ''}` : `${mins}분`;
    gapSummaryPill.textContent = `총 공강: ${timeText} (${gaps.length}회)`;
  } else {
    gapSummaryPill.textContent = '공강 없음 (연속 수업)';
  }

  // 수업과 공강 블록을 타임라인 리스트로 병합하여 시간순 정렬
  const timelineItems = [];

  dayClasses.forEach(c => {
    timelineItems.push({
      type: 'class',
      startMin: timeToMinutes(c.startTime),
      data: c
    });
  });

  gaps.forEach(g => {
    timelineItems.push({
      type: 'gap',
      startMin: g.startMin,
      data: g
    });
  });

  // 시작 시간 기준 오름차순 정렬
  timelineItems.sort((a, b) => a.startMin - b.startMin);

  // HTML 렌더링
  let html = '';
  timelineItems.forEach(item => {
    if (item.type === 'class') {
      const c = item.data;
      html += `
        <div class="timeline-item class-item">
          <div class="time-badge">
            <span>${c.startTime}</span>
            <span style="opacity:0.6;">~</span>
            <span>${c.endTime}</span>
          </div>
          <div class="item-content">
            <div>
              <h4>${c.name}</h4>
              <p><i class="fa-solid fa-location-dot"></i> ${c.room || '강의실 미지정'}</p>
            </div>
            <button class="btn-delete-item" onclick="deleteClass('${c.id}')" title="수업 삭제">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      `;
    } else {
      const g = item.data;
      const durationHours = Math.floor(g.durationMinutes / 60);
      const durationMins = g.durationMinutes % 60;
      const durationStr = durationHours > 0 
        ? `${durationHours}시간 ${durationMins > 0 ? durationMins + '분' : ''}`
        : `${durationMins}분`;

      html += `
        <div class="timeline-item gap-item" onclick="onGapClick(${g.durationMinutes})">
          <div class="time-badge">
            <span>${g.startTime}</span>
            <span style="opacity:0.6;">~</span>
            <span>${g.endTime}</span>
          </div>
          <div class="item-content">
            <div>
              <div class="gap-label">
                <i class="fa-solid fa-coffee"></i>
                <span>공강 시간</span>
                <span class="gap-duration-tag">${durationStr}</span>
              </div>
              <p>${g.prevClass} ➔ ${g.nextClass} 사이</p>
            </div>
            <div class="gap-action-hint">
              <span>할 일 추천 보기</span>
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

// 수업 등록 핸들러
function handleAddClass(e) {
  e.preventDefault();
  const name = document.getElementById('course-name').value.trim();
  const day = document.getElementById('course-day').value;
  const room = document.getElementById('course-room').value.trim();
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    alert('종료 시간은 시작 시간보다 늦어야 합니다!');
    return;
  }

  const newClass = {
    id: 'c_' + Date.now(),
    name,
    day,
    room,
    startTime,
    endTime
  };

  myClasses.push(newClass);
  saveMyClasses();

  // 탭 이동 및 다시 렌더링
  currentSelectedDay = day;
  document.querySelectorAll('.day-tab, .day-tab-dark').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.day === day);
  });

  renderTimeline(day);
  calculateAllMatches();

  // 폼 리셋
  document.getElementById('course-name').value = '';
  document.getElementById('course-room').value = '';
}

// 수업 삭제
window.deleteClass = function(id) {
  if (confirm('이 수업을 삭제하시겠습니까?')) {
    myClasses = myClasses.filter(c => c.id !== id);
    saveMyClasses();
    renderTimeline(currentSelectedDay);
    calculateAllMatches();
  }
};

// 타임라인 내 공강 블록 클릭 시 맞춤 할 일로 스크롤 및 필터 자동 지정
window.onGapClick = function(minutes) {
  let targetFilter = 'all';
  if (minutes < 30) targetFilter = 'short';
  else if (minutes < 60) targetFilter = 'medium';
  else if (minutes <= 120) targetFilter = 'long';
  else targetFilter = 'extra';

  // 필터 칩 활성화
  document.querySelectorAll('.chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === targetFilter);
  });

  renderActivities(targetFilter);

  // 안내 배너 문구 변경
  const bannerText = document.getElementById('banner-text');
  bannerText.textContent = `선택하신 ${minutes}분 공강에 딱 맞는 활동들을 추천해 드립니다!`;

  // 부드럽게 스크롤
  document.getElementById('recommend-section').scrollIntoView({ behavior: 'smooth' });
};

// --- 5. 맞춤 할 일 렌더링 ---

function renderActivities(category) {
  const container = document.getElementById('activity-card-container');
  const filtered = category === 'all' 
    ? ACTIVITIES 
    : ACTIVITIES.filter(a => a.category === category);

  container.innerHTML = filtered.map(item => `
    <div class="activity-card">
      <div>
        <div class="activity-top">
          <div class="activity-icon">
            <i class="fa-solid ${item.icon}"></i>
          </div>
          <span class="activity-duration">${item.durationLabel}</span>
        </div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
      <div>
        <span class="activity-tag">#추천활동 #공강활용</span>
      </div>
    </div>
  `).join('');
}

// --- 6. 친구 공강 매칭 알고리즘 (핵심) ---

/**
 * 나와 친구의 시간표를 비교하여 겹치는 공강 인터벌(Overlap Gap)을 찾는 알고리즘
 */
function findOverlappingGaps(friend) {
  const matches = [];
  const days = ['월', '화', '수', '목', '금'];

  days.forEach(day => {
    const myDayClasses = myClasses.filter(c => c.day === day);
    const friendDayClasses = (friend.classes || []).filter(c => c.day === day);

    // 둘 다 해당 요일에 2개 이상의 수업이 있어서 공강이 발생하는지 확인
    const myGaps = calculateGapsForDay(myDayClasses);
    const friendGaps = calculateGapsForDay(friendDayClasses);

    myGaps.forEach(mGap => {
      friendGaps.forEach(fGap => {
        // 인터벌 교집합 계산 공식:
        // overlapStart = max(myStart, friendStart)
        // overlapEnd = min(myEnd, friendEnd)
        const overlapStart = Math.max(mGap.startMin, fGap.startMin);
        const overlapEnd = Math.min(mGap.endMin, fGap.endMin);

        // 겹치는 구간이 최소 20분 이상일 경우 밥약/카공 가능 공강으로 판단
        if (overlapEnd - overlapStart >= 20) {
          matches.push({
            friendName: friend.name,
            day: day,
            startMin: overlapStart,
            endMin: overlapEnd,
            startTime: minutesToTime(overlapStart),
            endTime: minutesToTime(overlapEnd),
            overlapMinutes: overlapEnd - overlapStart
          });
        }
      });
    });
  });

  return matches;
}

// 친구 목록 렌더링
function renderFriendsList() {
  const container = document.getElementById('friends-list-container');
  if (friends.length === 0) {
    container.innerHTML = '<span style="color:#94a3b8; font-size:0.85rem;">등록된 친구가 없습니다. 샘플 친구를 추가해보세요!</span>';
    return;
  }

  container.innerHTML = friends.map(f => `
    <span class="friend-tag">
      <i class="fa-solid fa-user"></i> ${f.name} (${(f.classes || []).length}개 수업)
      <button class="remove-friend-btn" onclick="deleteFriend('${f.id}')" title="친구 삭제">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </span>
  `).join('');
}

// 친구 수업 추가 핸들러
function handleAddFriendClass(e) {
  e.preventDefault();
  const name = document.getElementById('friend-name').value.trim();
  const day = document.getElementById('friend-day').value;
  const course = document.getElementById('friend-course').value.trim();
  const startTime = document.getElementById('friend-start').value;
  const endTime = document.getElementById('friend-end').value;

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    alert('종료 시간은 시작 시간보다 늦어야 합니다!');
    return;
  }

  let existingFriend = friends.find(f => f.name === name);
  if (!existingFriend) {
    existingFriend = {
      id: 'f_' + Date.now(),
      name: name,
      classes: []
    };
    friends.push(existingFriend);
  }

  existingFriend.classes.push({
    day,
    name: course,
    startTime,
    endTime
  });

  saveFriends();
  renderFriendsList();
  calculateAllMatches();

  document.getElementById('friend-course').value = '';
  alert(`${name} 친구의 ${day}요일 수업이 등록되었습니다!`);
}

// 친구 삭제
window.deleteFriend = function(id) {
  if (confirm('이 친구의 시간표를 삭제하시겠습니까?')) {
    friends = friends.filter(f => f.id !== id);
    saveFriends();
    renderFriendsList();
    calculateAllMatches();
  }
};

// 전체 친구와의 겹치는 공강 매칭 결과 렌더링
function calculateAllMatches() {
  const container = document.getElementById('match-results-container');
  let allMatches = [];

  friends.forEach(friend => {
    const friendMatches = findOverlappingGaps(friend);
    allMatches = allMatches.concat(friendMatches);
  });

  if (allMatches.length === 0) {
    container.innerHTML = `
      <div class="empty-day-state">
        <i class="fa-solid fa-user-slash"></i>
        <p>현재 겹치는 공강 시간이 있는 친구가 없습니다.<br>수업을 추가하거나 친구의 시간표를 등록해보세요!</p>
      </div>
    `;
    updateHeroMatchStat(false);
    return;
  }

  updateHeroMatchStat(true, allMatches.length);

  container.innerHTML = allMatches.map(m => {
    const hours = Math.floor(m.overlapMinutes / 60);
    const mins = m.overlapMinutes % 60;
    const durationText = hours > 0 ? `${hours}시간 ${mins > 0 ? mins + '분' : ''}` : `${mins}분`;

    return `
      <div class="match-item">
        <div class="match-item-left">
          <h4>
            <i class="fa-solid fa-circle-check"></i> ${m.friendName} 친구와 ${m.day}요일 밥약 가능!
          </h4>
          <p>${m.startTime} ~ ${m.endTime} (${durationText} 동안 같이 공강)</p>
        </div>
        <div class="match-item-right">
          <span class="match-time-tag">${durationText} 매칭</span>
          <div>
            <a class="match-action-btn" onclick="alert('${m.friendName}님에게 카카오톡으로 [${m.day}요일 ${m.startTime}에 학식 먹자!]고 메시지를 보내보세요!')">
              밥약 신청하기 ➔
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- 7. 히어로 통계 및 유틸 ---

function updateHeroStats() {
  const dayClasses = myClasses.filter(c => c.day === currentSelectedDay);
  const gaps = calculateGapsForDay(dayClasses);
  const totalGapMinutes = gaps.reduce((sum, g) => sum + g.durationMinutes, 0);

  const statCount = document.getElementById('stat-gap-count');
  const statTotal = document.getElementById('stat-gap-total');

  if (statCount) statCount.textContent = `${gaps.length}개`;
  if (statTotal) {
    const hours = Math.floor(totalGapMinutes / 60);
    const mins = totalGapMinutes % 60;
    statTotal.textContent = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  }
}

function updateHeroMatchStat(hasMatch, count = 0) {
  const statFriend = document.getElementById('stat-friend-overlap');
  if (statFriend) {
    statFriend.textContent = hasMatch ? `${count}건 매칭!` : '매칭 없음';
    statFriend.style.color = hasMatch ? '#5db872' : '#8e8b82';
  }
}


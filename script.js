// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
  // 인증 상태 렌더링
  renderAuthInNavbar();
  // 모바일 메뉴 토글
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  // 성적계산기 버튼 추가
  const GRADE_CALC_INTERNAL = 'gpa.html';
  if (navMenu && !navMenu.querySelector('.grade-calc-btn')) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `<a href="#" class="nav-link grade-calc-btn">성적계산기</a>`;
    // 로그인/프로필 앞에 위치하도록 삽입
    const authSlot =
      navMenu.querySelector('.auth-slot') ||
      navMenu.querySelector('.login-btn')?.closest('.nav-item');
    if (authSlot && authSlot.parentElement === navMenu) {
      navMenu.insertBefore(li, authSlot);
    } else {
      navMenu.appendChild(li);
    }
    li.querySelector('.grade-calc-btn').addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = GRADE_CALC_INTERNAL;
    });
  }
  // 현재 페이지 nav 하이라이트
  (function highlightActiveNav() {
    const path = location.pathname.replace(/\\/g, '/');
    const is = (n) => path.endsWith('/' + n) || path.endsWith(n);
    const mark = (selector) => {
      const a = document.querySelector(selector);
      if (a) a.classList.add('active');
    };
    if (is('market.html')) mark("a.nav-link[href='market.html']");
    else if (is('timetable.html')) mark("a.nav-link[href='timetable.html']");
    else if (is('course-search.html')) mark('a.nav-link.course-search-btn');
    else if (is('gpa.html')) mark('a.nav-link.grade-calc-btn');
    else if (is('free-board.html'))
      mark(".dropdown a.dropdown-link[href='free-board.html']");
    else if (is('class-info.html'))
      mark(".dropdown a.dropdown-link[href='class-info.html']");
    else if (is('exam-info.html'))
      mark(".dropdown a.dropdown-link[href='exam-info.html']");
    else if (is('job-info.html'))
      mark(".dropdown a.dropdown-link[href='job-info.html']");
    else if (is('utksa.html'))
      mark(".dropdown a.dropdown-link[href='utksa.html']");
    else if (is('utkos.html'))
      mark(".dropdown a.dropdown-link[href='utkos.html']");
    else if (is('my-info.html')) mark("a.nav-link[href='my-info.html']");
    else mark('a.logo-link');
  })();

  // 우측 동아리 사이드바 전역 적용 (이미 있으면 건너뜀)
  function renderSidebarHot(asideEl) {
    try {
      const posts = JSON.parse(localStorage.getItem('campusTalkPosts') || '[]')
        .slice()
        .sort(
          (a, b) =>
            (b.likes || 0) - (a.likes || 0) ||
            new Date(b.timestamp) - new Date(a.timestamp)
        )
        .slice(0, 5);
      const wrap = asideEl.querySelector('.sidebarHotList');
      if (!wrap) return;
      wrap.innerHTML = '';
      posts.forEach((p) => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerHTML = `
          <a href="post.html?id=${encodeURIComponent(p.id)}">${escapeHtml(
          p.title || '무제'
        )}</a>
          <div class="sidebar-meta">👍 ${p.likes || 0} · ${formatRelativeTime(
          p.timestamp
        )}</div>
        `;
        wrap.appendChild(item);
      });
    } catch (e) {}
  }

  function wireSidebarSearch(asideEl) {
    const input = asideEl.querySelector('.sidebarSearchInput');
    const btn = asideEl.querySelector('.sidebarSearchBtn');
    if (!input || !btn) return;
    const doSearch = () => {
      const q = input.value.trim();
      if (!q) return;
      const url = new URL(location.origin + '/free-board.html');
      url.searchParams.set('q', q);
      url.searchParams.set('page', '1');
      window.location.href = url.pathname + url.search;
    };
    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }

  (function injectClubSidebar() {
    if (document.querySelector('.right-sidebar')) return;
    // 우선순위에 따라 메인 영역 선택
    const targetEl =
      document.querySelector('#board .container') ||
      document.querySelector('.board-content .container') ||
      document.querySelector('.market .container') ||
      document.querySelector('.timetable .container') ||
      document.querySelector('.gpa-wrap') ||
      document.querySelector('nav.navbar ~ * .container') ||
      document.querySelector('nav.navbar ~ .container') ||
      document.querySelector('.container');
    if (!targetEl) return;

    // 이미 사이드바 레이아웃인 경우 중복 방지
    if (targetEl.classList.contains('page-with-sidebar')) return;

    // 래퍼 생성
    const wrapper = document.createElement('div');
    wrapper.className = 'page-with-sidebar';
    const main = document.createElement('div');
    main.className = 'main-content';
    const aside = document.createElement('aside');
    aside.className = 'right-sidebar';
    aside.innerHTML = `
      <div class="sidebar-section">
        <h3>동아리</h3>
        <div class="club-list">
          <a class="club-item" href="utksa.html">
            <span class="emoji">🎯</span>
            <div>
              <div class="name">UTKSA</div>
              <div class="desc">학생회 활동 소식</div>
            </div>
          </a>
          <a class="club-item" href="utkos.html">
            <span class="emoji">🛠️</span>
            <div>
              <div class="name">UTKOS</div>
              <div class="desc">코딩/알고리즘 활동</div>
            </div>
          </a>
        </div>
        <div class="sidebar-widget">
          <h4>실시간 인기 글</h4>
          <div class="sidebar-search">
            <input class="sidebarSearchInput" type="text" placeholder="게시글 검색" />
            <button class="sidebarSearchBtn">검색</button>
          </div>
          <div class="sidebar-list sidebarHotList"></div>
        </div>
      </div>`;

    // 기존 컨테이너 자식들을 main으로 이동
    const children = Array.from(targetEl.childNodes);
    children.forEach((node) => {
      if (node !== wrapper) main.appendChild(node);
    });
    // 래퍼 조립 및 삽입
    wrapper.appendChild(main);
    wrapper.appendChild(aside);
    targetEl.appendChild(wrapper);
    // 홈에서도 고정하지 않고 페이지 레이아웃 내에서 스크롤되도록 유지
    renderSidebarHot(aside);
    wireSidebarSearch(aside);
  })();
  // 과목 검색 링크 추가 (중복 방지)
  if (navMenu && !navMenu.querySelector('.course-search-btn')) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `<a href="course-search.html" class="nav-link course-search-btn">과목검색</a>`;
    const insertBefore = navMenu
      .querySelector('.login-btn')
      ?.closest('.nav-item');
    if (insertBefore && insertBefore.parentElement === navMenu) {
      navMenu.insertBefore(li, insertBefore);
    } else {
      navMenu.appendChild(li);
    }
  }

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // 스크롤 시 네비게이션 바 스타일 변경
  window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
  });

  // 스크롤 애니메이션
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // 애니메이션을 적용할 요소들에 fade-in 클래스 추가
  const animateElements = document.querySelectorAll(
    '.post-card, .market-item, .course-slot, .board-category, .market-category'
  );
  animateElements.forEach((el) => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // 부드러운 스크롤 (모바일 대응)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 70; // 네비게이션 바 높이만큼 조정
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });

  // 로고 클릭 시 홈 화면으로 이동
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      const isIndex =
        /(^|\/)index\.html$/.test(location.pathname) ||
        location.pathname === '/' ||
        location.pathname === '';
      if (isIndex) {
        const homeSection = document.querySelector('#home');
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.location.href = 'index.html';
    });
  }

  // CTA 버튼 클릭 이벤트
  const ctaButtons = document.querySelectorAll('.cta-button');
  ctaButtons.forEach((button) => {
    button.addEventListener('click', function () {
      if (this.classList.contains('primary')) {
        // 가입하기 버튼 - 로그인 페이지로 이동
        window.location.href = 'login.html';
      } else {
        // 둘러보기 버튼 - 게시판 석션으로 스크롤
        const boardSection = document.querySelector('#board');
        if (boardSection) {
          boardSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 히어로 통합 검색
  const heroInput = document.getElementById('heroSearchInput');
  const heroBtn = document.getElementById('heroSearchBtn');
  function goSearch(q) {
    if (!q) return;
    // 자유게시판으로 이동하여 q 파라미터 전달
    const url = new URL(location.origin + '/free-board.html');
    url.searchParams.set('q', q);
    url.searchParams.set('page', '1');
    window.location.href = url.pathname + url.search;
  }
  if (heroBtn && heroInput) {
    heroBtn.addEventListener('click', () => goSearch(heroInput.value.trim()));
    heroInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') goSearch(heroInput.value.trim());
    });
  }
  document.querySelectorAll('.hero-tags .tag').forEach((tag) => {
    tag.addEventListener('click', () => goSearch(tag.getAttribute('data-q')));
  });

  // 게시판 카테고리 클릭 이벤트
  const boardCategories = document.querySelectorAll('.board-category');
  boardCategories.forEach((category) => {
    category.addEventListener('click', function () {
      boardCategories.forEach((c) => c.classList.remove('active'));
      this.classList.add('active');
      filterPosts(this.textContent);
    });
  });

  // 중고거래 카테고리 클릭 이벤트
  const marketCategories = document.querySelectorAll('.market-category');
  marketCategories.forEach((category) => {
    category.addEventListener('click', function () {
      marketCategories.forEach((c) => c.classList.remove('active'));
      this.classList.add('active');
      filterMarketItems(this.textContent);
    });
  });

  // 글쓰기 버튼 클릭 이벤트
  const writePostBtn = document.querySelector('.board-nav a.write-post-btn');
  if (writePostBtn) {
    writePostBtn.addEventListener('click', () => {
      if (!getCurrentUser()) {
        showNotification('로그인이 필요한 서비스입니다.', 'info');
        window.location.href = 'login.html';
        return;
      }
      window.location.href = 'write-post.html';
    });
  }

  // 판매하기 버튼 클릭 이벤트
  const sellItemBtn = document.querySelector('.sell-item-btn');
  if (sellItemBtn) {
    sellItemBtn.addEventListener('click', () => {
      showNotification('로그인이 필요한 서비스입니다.', 'info');
    });
  }

  // 과목 추가 버튼 클릭 이벤트
  const addCourseBtn = document.querySelector('.add-course-btn');
  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => {
      if (!getCurrentUser()) {
        showNotification('로그인이 필요한 서비스입니다.', 'info');
        window.location.href = 'login.html';
        return;
      }
    });
  }

  // 페이지 로드 완료 시 애니메이션 및 게시판으로 자동 스크롤
  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      document.body.style.opacity = '1';

      // 첫 방문 시 게시판으로 자동 스크롤 (선택사항)
      if (!sessionStorage.getItem('hasVisited')) {
        sessionStorage.setItem('hasVisited', 'true');
        setTimeout(() => {
          const boardSection = document.querySelector('#board');
          if (boardSection) {
            boardSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 1000);
      }

      // 홈: 최근 게시글 렌더링
      renderRecentPosts();

      // 시간표: 저장된 과목 반영
      renderTimetableFromStorage();
    }, 100);
  });

  // 게시판 필터링 함수
  function filterPosts(category) {
    const posts = document.querySelectorAll('.post-card');
    posts.forEach((post) => {
      if (
        category === '전체' ||
        post.querySelector('.post-category').textContent === category
      ) {
        post.style.display = 'block';
      } else {
        post.style.display = 'none';
      }
    });
  }

  // 중고거래 필터링 함수
  function filterMarketItems(category) {
    const items = document.querySelectorAll('.market-item');
    items.forEach((item) => {
      if (
        category === '전체' ||
        item.querySelector('.item-title').textContent.includes(category)
      ) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // 이메일 유효성 검사 함수
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 인증 유틸 및 UI
  function getCurrentUser() {
    try {
      const local = localStorage.getItem('campusTalkCurrentUser');
      const session = sessionStorage.getItem('campusTalkCurrentUser');
      return local ? JSON.parse(local) : session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  function logout() {
    localStorage.removeItem('campusTalkCurrentUser');
    sessionStorage.removeItem('campusTalkCurrentUser');
    showNotification('로그아웃되었습니다.', 'success');
    renderAuthInNavbar();
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  }

  function renderAuthInNavbar() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    const existingAuth = navMenu.querySelector('.auth-slot');
    if (existingAuth) existingAuth.remove();
    const user = getCurrentUser();

    // 기존 로그인 링크(들) 표시/숨김
    const loginLinks = document.querySelectorAll('.login-btn');
    loginLinks.forEach((a) => {
      const container = a.closest('.nav-item') || a;
      container.style.display = user ? 'none' : '';
    });

    if (user) {
      const li = document.createElement('li');
      li.className = 'nav-item auth-slot dropdown dropdown-right';
      const avatarHtml = user.avatarDataUrl
        ? `<img src="${user.avatarDataUrl}" alt="avatar" style="width:26px; height:26px; border-radius:9999px; object-fit:cover;" />`
        : `<span style="display:inline-flex; width:26px; height:26px; border-radius:9999px; background:#e5e7eb; align-items:center; justify-content:center; font-size:12px; color:#374151;">${(
            user.name || 'U'
          ).slice(0, 1)}</span>`;
      li.innerHTML = `
        <a href="my-info.html" class="nav-link profile-trigger" style="display:inline-flex; align-items:center; gap:8px;">
          ${avatarHtml}
          <span>${user.name || user.email}</span>
          <span style="font-size:12px; color:#6b7280;">▼</span>
        </a>
        <ul class="dropdown-menu profile-menu">
          <li><a href="my-info.html" class="dropdown-link">내 정보</a></li>
          <li><a href="my-info.html#profile" class="dropdown-link">프로필 설정</a></li>
          <li><a href="my-info.html#password" class="dropdown-link">비밀번호 변경</a></li>
          <li><a href="#" class="dropdown-link logout-link">로그아웃</a></li>
        </ul>`;
      navMenu.appendChild(li);
      const logoutA = li.querySelector('.logout-link');
      if (logoutA) {
        logoutA.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }
    }
  }

  // 알림 표시 함수
  function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

    // 스타일 적용
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${
              type === 'success'
                ? '#10b981'
                : type === 'error'
                ? '#ef4444'
                : '#3b82f6'
            };
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

    // 알림 내용 스타일
    const notificationContent = notification.querySelector(
      '.notification-content'
    );
    notificationContent.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        `;

    // 닫기 버튼 스타일
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;

    // 닫기 버튼 이벤트
    closeButton.addEventListener('click', () => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    });

    // 알림 표시
    document.body.appendChild(notification);

    // 애니메이션
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // 자동 제거
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // 스크롤 진행률 표시
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        z-index: 10001;
        transition: width 0.1s ease;
    `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });

  // 마우스 움직임에 따른 카드 효과
  const floatingCard = document.querySelector('.floating-card');
  if (floatingCard) {
    document.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;

      floatingCard.style.transform = `translate(${x}px, ${y}px) rotateY(${
        x * 0.5
      }deg) rotateX(${-y * 0.5}deg)`;
    });
  }

  // 페이지 로드 완료 시 애니메이션 및 게시판으로 자동 스크롤
  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      document.body.style.opacity = '1';

      // 홈: 최근 게시글 렌더링
      renderRecentPosts();
      renderHomeFeeds();
      updateHomeProfileCard();
    }, 100);
  });

  // 키보드 네비게이션 지원
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // ESC 키로 모바일 메뉴 닫기
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // 터치 제스처 지원 (모바일)
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // 왼쪽으로 스와이프 - 다음 섹션으로
        navigateToNextSection();
      } else {
        // 오른쪽으로 스와이프 - 이전 섹션으로
        navigateToPreviousSection();
      }
    }
  }

  function navigateToNextSection() {
    const sections = ['#home', '#about', '#services', '#contact'];
    const currentSection = getCurrentSection();
    const currentIndex = sections.indexOf(currentSection);
    const nextIndex = (currentIndex + 1) % sections.length;

    const nextSection = document.querySelector(sections[nextIndex]);
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function navigateToPreviousSection() {
    const sections = ['#home', '#about', '#services', '#contact'];
    const currentSection = getCurrentSection();
    const currentIndex = sections.indexOf(currentSection);
    const prevIndex =
      currentIndex === 0 ? sections.length - 1 : currentIndex - 1;

    const prevSection = document.querySelector(sections[prevIndex]);
    if (prevSection) {
      prevSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function getCurrentSection() {
    const sections = ['#home', '#about', '#services', '#contact'];
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.querySelector(sections[i]);
      if (section && section.offsetTop <= scrollPosition) {
        return sections[i];
      }
    }
    return '#home';
  }

  // 최근 게시글 렌더링
  function formatRelativeTime(isoString) {
    try {
      const then = new Date(isoString).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - then) / 1000));
      if (diffSec < 5) return '방금 전';
      if (diffSec < 60) return `${diffSec}초 전`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}분 전`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}시간 전`;
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay < 7) return `${diffDay}일 전`;
      const diffWeek = Math.floor(diffDay / 7);
      if (diffWeek < 5) return `${diffWeek}주 전`;
      const diffMonth = Math.floor(diffDay / 30);
      if (diffMonth < 12) return `${diffMonth}개월 전`;
      const diffYear = Math.floor(diffDay / 365);
      return `${diffYear}년 전`;
    } catch (e) {
      return '방금 전';
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function boardBadge(boardKey) {
    const map = {
      free: '자유',
      class: '수업',
      exam: '시험',
      job: '취업',
      club: '동아리',
      'club-utkos': 'UTKOS',
      'club-utksa': 'UTKSA',
    };
    return map[boardKey] || '게시판';
  }

  function renderRecentPosts() {
    const wrap = document.getElementById('recentPosts');
    if (!wrap) return;
    let posts = [];
    try {
      posts = JSON.parse(localStorage.getItem('campusTalkPosts') || '[]');
    } catch (e) {}
    if (!Array.isArray(posts) || posts.length === 0) {
      wrap.innerHTML =
        '<div class="small" style="color:#6b7280;">최근 게시글이 없습니다.</div>';
      return;
    }
    wrap.innerHTML = '';
    const boardToAccent = {
      free: 'accent-blue',
      class: 'accent-green',
      exam: 'accent-rose',
      job: 'accent-amber',
      club: 'accent-indigo',
      'club-utkos': 'accent-purple',
    };
    posts
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 4)
      .forEach((p) => {
        const a = document.createElement('a');
        a.href = `post.html?id=${encodeURIComponent(p.id)}`;
        const accent = boardToAccent[p.board] || 'accent-blue';
        a.className = `recent-card ${accent}`;
        const previewText = String(p.content || '').replace(/\n/g, ' ');
        a.innerHTML = `
          <span class="badge">${boardBadge(p.board)}</span>
          <div class="title">${escapeHtml(p.title)}</div>
          <div class="preview">${escapeHtml(previewText.slice(0, 80))}${
          previewText.length > 80 ? '...' : ''
        }</div>
          <div class="meta"><span>⏱ ${formatRelativeTime(
            p.timestamp
          )}</span><span class="dot">·</span><span>👍 ${
          p.likes || 0
        }</span><span class="dot">·</span><span>💬 ${
          p.comments || 0
        }</span></div>
        `;
        wrap.appendChild(a);
      });
  }

  // 홈 보드별 피드 상위 5개 렌더링
  function renderHomeFeeds() {
    const map = {
      free: { id: '#feed-free', href: 'free-board.html' },
      class: { id: '#feed-class', href: 'class-info.html' },
      exam: { id: '#feed-exam', href: 'exam-info.html' },
      job: { id: '#feed-job', href: 'job-info.html' },
    };
    let posts = [];
    try {
      posts = JSON.parse(localStorage.getItem('campusTalkPosts') || '[]');
    } catch (e) {}
    const byBoard = { free: [], class: [], exam: [], job: [] };
    posts.forEach((p) => {
      if (byBoard[p.board]) byBoard[p.board].push(p);
    });
    function renderBoardList(boardKey, sort) {
      const ul = document.querySelector(map[boardKey].id);
      if (!ul) return;
      ul.innerHTML = '';
      let list = byBoard[boardKey].slice();
      if (sort === 'hot') {
        list.sort(
          (a, b) =>
            (b.likes || 0) - (a.likes || 0) ||
            new Date(b.timestamp) - new Date(a.timestamp)
        );
      } else {
        list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
      list = list.slice(0, 4);
      if (list.length === 0) {
        const li = document.createElement('li');
        li.className = 'feed-meta';
        li.textContent = '게시글이 없습니다.';
        ul.appendChild(li);
        return;
      }
      list.forEach((p) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="post.html?id=${encodeURIComponent(
          p.id
        )}">${escapeHtml(p.title || '무제')}</a><div class="feed-meta">👍 ${
          p.likes || 0
        } · ${formatRelativeTime(p.timestamp)}</div>`;
        ul.appendChild(li);
      });
    }
    // 초기 렌더: 각 보드를 최신순 4개로
    Object.keys(byBoard).forEach((k) => renderBoardList(k, 'recent'));
    // 탭 클릭 핸들러 바인딩
    document.querySelectorAll('.feed-tabs .tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.feed-tabs');
        if (!wrap) return;
        wrap
          .querySelectorAll('.tab')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const boardKey = wrap.getAttribute('data-board');
        const sort = btn.getAttribute('data-sort');
        renderBoardList(boardKey, sort);
      });
    });
  }

  // 홈 프로필 카드 사용자 정보 반영
  function updateHomeProfileCard() {
    const card = document.querySelector('.left-profile .profile-card');
    if (!card) return;
    const user = getCurrentUser();
    const avatarEl = card.querySelector('.avatar');
    const nameEl = card.querySelector('.name');
    const metaEl = card.querySelector('.meta');
    const loginBtn = card.querySelector('.btn.small.secondary');
    const myInfoBtn = card.querySelector('.btn.small');
    const statPosts = card.querySelector('#statPosts');
    const statComments = card.querySelector('#statComments');
    const statLikes = card.querySelector('#statLikes');
    if (user) {
      // avatar
      if (user.avatarDataUrl) {
        avatarEl.innerHTML = `<img src="${user.avatarDataUrl}" alt="avatar" style="width:72px; height:72px; border-radius:9999px; object-fit:cover;" />`;
      } else {
        const ch = (user.name || user.email || 'U').slice(0, 1);
        avatarEl.textContent = ch;
      }
      // name/meta
      nameEl.textContent = user.name || user.email || '사용자';
      metaEl.textContent = user.email || '';
      // buttons
      if (loginBtn) loginBtn.style.display = 'none';
      if (myInfoBtn) myInfoBtn.style.display = '';
      // activity summary (simple local calc)
      try {
        const posts = JSON.parse(
          localStorage.getItem('campusTalkPosts') || '[]'
        );
        const myPosts = posts.filter(
          (p) => (p.authorEmail || '') === (user.email || '') || p.anonymous
        );
        const myLikes = myPosts.reduce((s, p) => s + (p.likes || 0), 0);
        if (statPosts) statPosts.textContent = String(myPosts.length);
        if (statLikes) statLikes.textContent = String(myLikes);
        // comments are not stored separately; leave 0 or compute if available later
        if (statComments) statComments.textContent = String(0);
      } catch (e) {}
    } else {
      avatarEl.textContent = '🙂';
      nameEl.textContent = '캠퍼스톡 사용자';
      metaEl.textContent = '환영합니다!';
      if (loginBtn) loginBtn.style.display = '';
      if (myInfoBtn) myInfoBtn.style.display = '';
      if (statPosts) statPosts.textContent = '0';
      if (statLikes) statLikes.textContent = '0';
      if (statComments) statComments.textContent = '0';
    }
  }

  // ===== 시간표: 저장된 과목을 렌더링 =====
  function renderTimetableFromStorage() {
    const grid = document.querySelector('.timetable-grid');
    if (!grid) return;
    const dayColumns = Array.from(grid.querySelectorAll('.day-column'));
    if (dayColumns.length < 5) return;

    // 기존 데모 슬롯 제거 (헤더 제외)
    dayColumns.forEach((col) => {
      Array.from(col.children).forEach((child) => {
        if (!child.classList.contains('day-header')) child.remove();
      });
    });

    // 저장된 과목 불러오기
    let saved = [];
    try {
      saved = JSON.parse(
        localStorage.getItem('campusTalkTimetableCourses') || '[]'
      );
    } catch (e) {
      saved = [];
    }

    if (!Array.isArray(saved) || saved.length === 0) {
      // 표시할 과목이 없으면 안내만
      const container = grid.parentElement;
      if (container && !container.querySelector('.tt-empty')) {
        const note = document.createElement('div');
        note.className = 'tt-empty';
        note.style.cssText =
          'text-align:center; color:#6b7280; margin-top:8px;';
        note.textContent = '저장된 과목이 없습니다. 과목검색에서 추가하세요.';
        container.appendChild(note);
      }
      return;
    }

    const dayToIdx = (day) => {
      const d = String(day || '').toLowerCase();
      if (d.startsWith('mon') || d === '월') return 0;
      if (d.startsWith('tue') || d === '화') return 1;
      if (d.startsWith('wed') || d === '수') return 2;
      if (d.startsWith('thu') || d === '목') return 3;
      if (d.startsWith('fri') || d === '금') return 4;
      return -1;
    };

    const colors = ['#dbeafe', '#fef3c7', '#d1fae5', '#f3e8ff', '#fce7f3'];
    let colorIdx = 0;

    saved.forEach((course) => {
      const color = colors[colorIdx++ % colors.length];
      (course.meetings || []).forEach((m) => {
        const idx = dayToIdx(m.day);
        if (idx < 0 || idx >= dayColumns.length) return;
        const col = dayColumns[idx];
        const slot = document.createElement('div');
        slot.className = 'course-slot';
        slot.style.background = color;
        const roomText = m.room ? ` · ${m.room}` : '';
        slot.innerHTML = `
          <div class="course-info">
            <h4>${escapeHtml(course.code || course.title || '과목')}</h4>
            <p>${escapeHtml(m.campus || '')}${escapeHtml(roomText)}</p>
            <p>${escapeHtml(m.day || '')} ${escapeHtml(
          m.start || ''
        )}-${escapeHtml(m.end || '')}</p>
          </div>
        `;
        col.appendChild(slot);
      });
    });
  }
});

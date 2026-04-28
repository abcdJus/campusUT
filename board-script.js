// 게시판 전용 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function () {
  // 로컬 저장 게시글 렌더링
  // renderSavedPosts();

  // 검색 기능
  const searchInput = document.querySelector('.search-box input');
  const searchBtn = document.querySelector('.search-btn');

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  function performSearch() {
    const query = (searchInput ? searchInput.value : '').trim();
    currentQuery = query;
    const params = new URLSearchParams(location.search);
    if (query) params.set('q', query);
    else params.delete('q');
    // 페이지를 1로 리셋
    params.set('page', '1');
    history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    renderPage(1);
  }

  // 정렬 기능
  const sortSelect = document.querySelector('.sort-options select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      const sortType = this.value;
      showNotification(`${sortType}으로 정렬되었습니다.`, 'info');
      // 실제 정렬 로직은 여기에 구현
    });
  }

  // 게시글 클릭 이벤트
  const postTitles = document.querySelectorAll('.post-title');
  postTitles.forEach((title) => {
    if (title.tagName && title.tagName.toLowerCase() === 'a') return;
    title.addEventListener('click', function () {
      showNotification('게시글 상세보기 기능은 개발 중입니다.', 'info');
    });
  });

  // 글쓰기 버튼
  const writeBtn = document.querySelector('.write-post-btn');
  if (writeBtn) {
    writeBtn.addEventListener('click', function () {
      showNotification('로그인이 필요한 서비스입니다.', 'info');
    });
  }

  // 페이지네이션 (동적 생성으로 대체)
  // const pageBtns = document.querySelectorAll('.page-btn');
  // pageBtns.forEach((btn) => { /* static handlers removed */ });

  // 좋아요, 댓글 클릭 이벤트 (정적 요소만 해당)
  const likeBtns = document.querySelectorAll('.likes');
  const commentBtns = document.querySelectorAll('.comments');

  likeBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const currentLikes = parseInt(this.textContent.split(' ')[1]);
      this.textContent = `👍 ${currentLikes + 1}`;
      this.style.background = '#dbeafe';
      this.style.color = '#2563eb';
      this.style.borderColor = '#2563eb';

      setTimeout(() => {
        this.style.background = '#f8fafc';
        this.style.color = '#666';
        this.style.borderColor = '#e2e8f0';
      }, 1000);
    });
  });

  commentBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      showNotification('댓글 기능은 개발 중입니다.', 'info');
    });
  });

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
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
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
    }, 3000);
  }

  // 페이지 로드 시 애니메이션
  window.addEventListener('load', () => {
    const postItems = document.querySelectorAll('.post-item');
    postItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'all 0.5s ease';

      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 100);
    });
  });

  // ===== 유틸 및 렌더링 함수들 =====
  const POSTS_PER_PAGE = 20;
  let __allPosts = [];
  let currentQuery = '';

  function getCurrentBoardKey() {
    const titleEl = document.querySelector('.board-title');
    const title = titleEl ? titleEl.textContent : '';
    if (title.includes('자유')) return 'free';
    if (title.includes('수업')) return 'class';
    if (title.includes('시험')) return 'exam';
    if (title.includes('취업')) return 'job';
    if (title.toLowerCase().includes('utkos')) return 'club-utkos';
    if (title.toLowerCase().includes('utksa')) return 'club-utksa';
    const href = location.pathname;
    if (href.includes('free-board')) return 'free';
    if (href.includes('class-info')) return 'class';
    if (href.includes('exam-info')) return 'exam';
    if (href.includes('job-info')) return 'job';
    if (href.includes('utkos')) return 'club-utkos';
    if (href.includes('utksa')) return 'club-utksa';
    return 'free';
  }

  function loadSavedPosts() {
    try {
      return JSON.parse(localStorage.getItem('campusTalkPosts') || '[]');
    } catch (e) {
      return [];
    }
  }

  function savePosts(list) {
    try {
      localStorage.setItem('campusTalkPosts', JSON.stringify(list));
    } catch (e) {}
  }

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

  function getCurrentUser() {
    try {
      const local = localStorage.getItem('campusTalkCurrentUser');
      const session = sessionStorage.getItem('campusTalkCurrentUser');
      return local ? JSON.parse(local) : session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  function likesKeyForUser(user) {
    const id = (user && user.email) || 'guest';
    return `campusTalkLikes:${id}`;
  }

  function loadUserLikes(user) {
    try {
      return JSON.parse(localStorage.getItem(likesKeyForUser(user)) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveUserLikes(user, map) {
    try {
      localStorage.setItem(likesKeyForUser(user), JSON.stringify(map));
    } catch (e) {}
  }

  function setLikedStyle(btn, liked) {
    if (!btn) return;
    if (liked) {
      btn.style.background = '#dbeafe';
      btn.style.color = '#2563eb';
      btn.style.borderColor = '#2563eb';
    } else {
      btn.style.background = '#f8fafc';
      btn.style.color = '#666';
      btn.style.borderColor = '#e2e8f0';
    }
  }

  function createPostItem(post) {
    const item = document.createElement('div');
    item.className = 'post-item';

    const authorText = post.anonymous ? '익명' : '익명';
    const timeText = formatRelativeTime(post.timestamp);

    const preview =
      (post.content || '').replace(/\n/g, ' ').slice(0, 80) +
      (post.content && post.content.length > 80 ? '...' : '');

    item.innerHTML = `
      <div class="post-info">
        <h3>
          <a class="post-title" href="post.html?id=${encodeURIComponent(
            post.id
          )}">${escapeHtml(post.title)}</a>
        </h3>
        <p class="post-preview">${escapeHtml(preview)}</p>
        <div class="post-meta">
          <span class="author">${authorText}</span>
          <span class="time">${timeText} 작성</span>
        </div>
      </div>
      <div class="post-stats">
        <span class="likes">👍 ${post.likes || 0}</span>
        <span class="comments">💬 ${post.comments || 0}</span>
      </div>
    `;

    const titleEl = item.querySelector('.post-title');
    if (titleEl && titleEl.tagName && titleEl.tagName.toLowerCase() !== 'a') {
      titleEl.addEventListener('click', function () {
        showNotification('게시글 상세보기 기능은 개발 중입니다.', 'info');
      });
    }

    const likeEl = item.querySelector('.likes');
    if (likeEl) {
      // 초기 좋아요 상태 반영
      const user = getCurrentUser();
      const likedMap = loadUserLikes(user);
      const isLiked = !!likedMap[post.id];
      setLikedStyle(likeEl, isLiked);

      likeEl.addEventListener('click', function () {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          showNotification('로그인이 필요한 서비스입니다.', 'info');
          setTimeout(() => (window.location.href = 'login.html'), 600);
          return;
        }

        const posts = loadSavedPosts();
        const idx = posts.findIndex((p) => p.id === post.id);
        if (idx === -1) return;

        const map = loadUserLikes(currentUser);
        const already = !!map[post.id];

        // 토글 처리 및 카운트 보정
        if (already) {
          posts[idx].likes = Math.max(0, (posts[idx].likes || 0) - 1);
          delete map[post.id];
        } else {
          posts[idx].likes = (posts[idx].likes || 0) + 1;
          map[post.id] = true;
        }

        // 저장
        savePosts(posts);
        saveUserLikes(currentUser, map);

        // 메모리 및 UI 업데이트
        const inMemory = __allPosts.find((p) => p.id === post.id);
        if (inMemory) inMemory.likes = posts[idx].likes;
        likeEl.textContent = `👍 ${posts[idx].likes || 0}`;
        setLikedStyle(likeEl, !already);
      });
    }

    const commentEl = item.querySelector('.comments');
    if (commentEl) {
      commentEl.addEventListener('click', function () {
        showNotification('댓글 기능은 개발 중입니다.', 'info');
      });
    }

    return item;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getFilteredPosts() {
    if (!currentQuery) return __allPosts;
    const q = currentQuery.toLowerCase();
    return __allPosts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q)
    );
  }

  // 새: 게시글 전체 로드 + 페이지 렌더링
  function initBoard() {
    const boardKey = getCurrentBoardKey();
    __allPosts = loadSavedPosts()
      .filter((p) => p.board === boardKey)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const params = new URLSearchParams(location.search);
    currentQuery = (params.get('q') || '').trim();
    if (searchInput) searchInput.value = currentQuery;
    const page = getCurrentPage();
    renderPage(page);
  }

  function getCurrentPage() {
    const params = new URLSearchParams(location.search);
    const p = parseInt(params.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }

  function setPage(page) {
    const params = new URLSearchParams(location.search);
    params.set('page', String(page));
    const url = `${location.pathname}?${params.toString()}`;
    history.replaceState({}, '', url);
    renderPage(page);
  }

  function renderPage(page) {
    const list = document.querySelector('.posts-list');
    if (!list) return;
    list.innerHTML = '';

    const filtered = getFilteredPosts();
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const slice = filtered.slice(start, end);

    if (slice.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding: 24px; color: #6b7280; text-align:center;';
      empty.textContent = currentQuery
        ? '검색 결과가 없습니다.'
        : '게시글이 없습니다.';
      list.appendChild(empty);
    } else {
      slice.forEach((post) => list.appendChild(createPostItem(post)));
    }
    renderPagination(totalPages, currentPage);
  }

  function renderPagination(totalPages, currentPage) {
    const container = document.querySelector('.pagination');
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '< 이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => setPage(currentPage - 1));
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = String(i);
      btn.addEventListener('click', () => setPage(i));
      container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn next';
    nextBtn.textContent = '다음 >';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => setPage(currentPage + 1));
    container.appendChild(nextBtn);
  }

  // 초기 렌더
  initBoard();
});

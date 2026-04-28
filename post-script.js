// 게시글 상세 페이지 스크립트
document.addEventListener('DOMContentLoaded', function () {
  const titleEl = document.getElementById('postTitle');
  const authorEl = document.getElementById('postAuthor');
  const timeEl = document.getElementById('postTime');
  const viewsEl = document.getElementById('postViews');
  const contentEl = document.getElementById('postContent');
  const filesEl = document.getElementById('postFiles');
  const likeBtn = document.getElementById('likeBtn');
  const backToBoard = document.getElementById('backToBoard');
  const commentForm = document.getElementById('commentForm');
  const commentText = document.getElementById('commentText');
  const commentsList = document.getElementById('commentsList');
  const commentsTitle = document.getElementById('commentsTitle');
  const commentCount = document.getElementById('commentCount');
  const commentSubmitBtn = document.getElementById('commentSubmitBtn');

  const params = new URLSearchParams(location.search);
  const postId = params.get('id');
  if (!postId) {
    showToast('잘못된 접근입니다.', 'error');
    return;
  }

  const posts = loadPosts();
  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex === -1) {
    showToast('게시글을 찾을 수 없습니다.', 'error');
    return;
  }

  const post = posts[postIndex];

  // 조회수 증가 및 저장
  posts[postIndex].views = (posts[postIndex].views || 0) + 1;
  savePosts(posts);

  // 렌더링
  titleEl.textContent = post.title || '제목 없음';
  authorEl.textContent = post.anonymous ? '익명' : '익명';
  timeEl.textContent = formatRelativeTime(post.timestamp) + '작성';
  viewsEl.textContent = `조회 ${posts[postIndex].views || 0}`;
  contentEl.innerHTML = (post.content || '').replace(/\n/g, '<br>');
  // 좋아요 초기 렌더
  renderLike();

  if (Array.isArray(post.files) && post.files.length > 0) {
    filesEl.style.display = '';
    filesEl.innerHTML = `
      <h4>첨부파일 (${post.files.length}개)</h4>
      <ul class="file-list-detail" style="margin-top:8px;">
        ${post.files
          .map(
            (f) => `
              <li style="padding:6px 0; color:#555;">
                <span>📎 ${escapeHtml(f.name || '')}</span>
                <span style="margin-left:8px; font-size:12px; color:#888;">${
                  f.type || ''
                } ${formatSize(f.size)}</span>
              </li>
            `
          )
          .join('')}
      </ul>
    `;
  }

  // 댓글 초기 렌더링
  renderComments();

  // 댓글 등록
  commentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast('로그인이 필요합니다.', 'error');
      setTimeout(() => (window.location.href = 'login.html'), 600);
      return;
    }

    const text = (commentText.value || '').trim();
    if (!text) return;

    const newComment = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      parentId: null,
      text,
      timestamp: new Date().toISOString(),
      author: currentUser.name || '익명',
    };

    posts[postIndex].commentsList = posts[postIndex].commentsList || [];
    posts[postIndex].commentsList.push(newComment);
    posts[postIndex].comments = (posts[postIndex].comments || 0) + 1;
    savePosts(posts);

    commentText.value = '';
    if (commentCount) commentCount.textContent = '0';
    if (commentSubmitBtn) commentSubmitBtn.disabled = true;
    renderComments();
    updateCommentsTitle();
  });

  // 목록으로 이동 링크
  backToBoard.addEventListener('click', function (e) {
    e.preventDefault();
    const boardUrls = {
      free: 'free-board.html',
      class: 'class-info.html',
      exam: 'exam-info.html',
      job: 'job-info.html',
    };
    const url = boardUrls[post.board] || 'index.html';
    location.href = url;
  });

  function loadPosts() {
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

  // ===== 좋아요 (계정당 1개 토글) =====
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
  function setLikeBtnStyle(liked) {
    if (!likeBtn) return;
    if (liked) {
      likeBtn.style.background = '#2563eb';
      likeBtn.style.color = '#fff';
      likeBtn.style.borderColor = '#2563eb';
    } else {
      likeBtn.style.background = '#fff';
      likeBtn.style.color = '#2563eb';
      likeBtn.style.borderColor = '#2563eb';
    }
  }
  function renderLike() {
    if (!likeBtn) return;
    likeBtn.textContent = `👍 ${posts[postIndex].likes || 0}`;
    const user = getCurrentUser();
    const likedMap = loadUserLikes(user);
    const liked = !!likedMap[postId];
    setLikeBtnStyle(liked);
  }
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (!user) {
        showToast('로그인이 필요합니다.', 'error');
        setTimeout(() => (window.location.href = 'login.html'), 600);
        return;
      }
      const map = loadUserLikes(user);
      const already = !!map[postId];
      if (already) {
        posts[postIndex].likes = Math.max(0, (posts[postIndex].likes || 0) - 1);
        delete map[postId];
      } else {
        posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
        map[postId] = true;
      }
      savePosts(posts);
      saveUserLikes(user, map);
      renderLike();
    });
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

  function formatSize(size) {
    if (!size && size !== 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let s = size;
    let i = 0;
    while (s >= 1024 && i < units.length - 1) {
      s /= 1024;
      i++;
    }
    return `${s.toFixed(1)}${units[i]}`;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${colors[type]}; color: #fff; padding: 10px 14px;
      border-radius: 8px; box-shadow: 0 8px 20px rgba(0,0,0,.2);
      transform: translateY(-20px); opacity: 0; transition: all .2s ease;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    });
    setTimeout(() => {
      el.style.transform = 'translateY(-20px)';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    }, 2500);
  }

  function updateCommentsTitle() {
    const count = (posts[postIndex].commentsList || []).length;
    if (commentsTitle) commentsTitle.textContent = `댓글 (${count})`;
  }

  function renderComments() {
    const list = posts[postIndex].commentsList || [];
    commentsList.innerHTML = '';
    const tree = buildTree(list);
    tree.forEach((node) => commentsList.appendChild(renderNode(node)));
    updateCommentsTitle();
  }

  function buildTree(flat) {
    const map = new Map();
    flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
    const roots = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortFn = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
    const sortTree = (arr) => {
      arr.sort(sortFn);
      arr.forEach((n) => sortTree(n.children));
    };
    sortTree(roots);
    return roots;
  }

  function renderNode(node) {
    const wrapper = document.createElement('div');
    wrapper.className = 'comment-item';
    wrapper.style.cssText =
      'border:1px solid #e5e7eb; border-radius:8px; padding:10px; margin:8px 0;';
    wrapper.innerHTML = `
      <div class="comment-body" style="white-space:pre-wrap; line-height:1.5; color:#333;">${escapeHtml(
        node.text
      )}</div>
      <div class="comment-meta" style="display:flex; gap:8px; color:#888; font-size:12px; margin-top:6px;">
        <span>${formatRelativeTime(node.timestamp)}</span>
        <button class="reply-btn" style="background:none; border:none; color:#2563eb; cursor:pointer; padding:0;">답글</button>
        <button class="delete-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:0;">삭제</button>
      </div>
      <div class="replies" style="margin-left:16px; margin-top:8px;"></div>
    `;

    const repliesEl = wrapper.querySelector('.replies');
    const replyBtn = wrapper.querySelector('.reply-btn');
    const deleteBtn = wrapper.querySelector('.delete-btn');

    replyBtn.addEventListener('click', () => {
      toggleReplyForm(wrapper, node.id);
    });

    deleteBtn.addEventListener('click', () => {
      if (!confirm('이 댓글을 삭제할까요?')) return;
      removeComment(node.id);
      renderComments();
    });

    node.children.forEach((child) => {
      repliesEl.appendChild(renderNode(child));
    });

    return wrapper;
  }

  function toggleReplyForm(container, parentId) {
    let form = container.querySelector('.reply-form');
    if (form) {
      form.remove();
      return;
    }
    form = document.createElement('form');
    form.className = 'reply-form';
    form.style.cssText =
      'display:flex; flex-direction:column; gap:8px; margin-top:8px;';
    form.innerHTML = `
      <textarea rows="3" placeholder="답글을 입력하세요" maxlength="1000" required style="resize: vertical; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none;"></textarea>
      <div class="reply-actions" style="display:flex; gap:8px; justify-content:flex-end; align-items:center;">
        <div class="reply-hint" style="margin-right:auto; font-size:12px; color:#6b7280;">
          <span class="reply-count">0</span>/1000 • Ctrl+Enter로 등록
        </div>
        <button type="button" class="cancel-reply write-post-btn" style="background:#e5e7eb; color:#333;">취소</button>
        <button type="submit" class="reply-submit write-post-btn" disabled>답글 등록</button>
      </div>
    `;
    container.appendChild(form);

    const textarea = form.querySelector('textarea');
    const cancelBtn = form.querySelector('.cancel-reply');
    const replyCount = form.querySelector('.reply-count');
    const replySubmit = form.querySelector('.reply-submit');
    cancelBtn.addEventListener('click', () => form.remove());

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentUser = getCurrentUser();
      if (!currentUser) {
        showToast('로그인이 필요합니다.', 'error');
        setTimeout(() => (window.location.href = 'login.html'), 600);
        return;
      }

      const text = (textarea.value || '').trim();
      if (!text) return;
      const newReply = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        parentId,
        text,
        timestamp: new Date().toISOString(),
        author: currentUser.name || '익명',
      };
      posts[postIndex].commentsList = posts[postIndex].commentsList || [];
      posts[postIndex].commentsList.push(newReply);
      posts[postIndex].comments = (posts[postIndex].comments || 0) + 1;
      savePosts(posts);
      renderComments();
    });

    textarea.addEventListener('input', () => {
      const len = (textarea.value || '').length;
      if (replyCount) replyCount.textContent = String(len);
      if (replySubmit) replySubmit.disabled = len === 0;
      autoResize(textarea, 2, 8);
    });
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  }

  function removeComment(commentId) {
    const list = posts[postIndex].commentsList || [];
    // 삭제 시 하위 댓글도 함께 삭제
    const toDelete = new Set([commentId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of list) {
        if (c.parentId && toDelete.has(c.parentId) && !toDelete.has(c.id)) {
          toDelete.add(c.id);
          changed = true;
        }
      }
    }
    posts[postIndex].commentsList = list.filter((c) => !toDelete.has(c.id));
    posts[postIndex].comments =
      (posts[postIndex].comments || 0) - toDelete.size;
    if (posts[postIndex].comments < 0) posts[postIndex].comments = 0;
    savePosts(posts);
  }

  function autoResize(textarea, minRows, maxRows) {
    const lineHeight = 20; // approximate px
    textarea.style.height = 'auto';
    const lines = Math.min(
      maxRows,
      Math.max(minRows, Math.ceil(textarea.scrollHeight / lineHeight))
    );
    textarea.style.height = String(lines * lineHeight) + 'px';
  }

  // 댓글 입력 UI 보조 (글자수/버튼 활성화/단축키)
  commentText.addEventListener('input', () => {
    const len = (commentText.value || '').length;
    if (commentCount) commentCount.textContent = String(len);
    if (commentSubmitBtn) commentSubmitBtn.disabled = len === 0;
    autoResize(commentText, 3, 10);
  });
  commentText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commentForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
});

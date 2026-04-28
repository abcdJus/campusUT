// 글쓰기 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('writePostForm');
  const titleInput = document.getElementById('postTitle');
  const contentInput = document.getElementById('postContent');
  const titleCount = document.getElementById('titleCount');
  const contentCount = document.getElementById('contentCount');
  const fileUpload = document.getElementById('fileUpload');
  const fileList = document.getElementById('fileList');
  const previewBtn = document.querySelector('.btn-preview');

  let selectedFiles = [];

  // 제목 글자 수 카운트
  titleInput.addEventListener('input', function () {
    const count = this.value.length;
    titleCount.textContent = count;

    if (count > 80) {
      titleCount.style.color = '#ef4444';
    } else if (count > 60) {
      titleCount.style.color = '#f59e0b';
    } else {
      titleCount.style.color = '#666';
    }
  });

  // 내용 글자 수 카운트
  contentInput.addEventListener('input', function () {
    const count = this.value.length;
    contentCount.textContent = count;

    if (count > 1800) {
      contentCount.style.color = '#ef4444';
    } else if (count > 1500) {
      contentCount.style.color = '#f59e0b';
    } else {
      contentCount.style.color = '#666';
    }
  });

  // 파일 업로드 처리
  fileUpload.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 5) {
      showNotification('최대 5개까지만 첨부할 수 있습니다.', 'error');
      return;
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB 제한
        showNotification(`${file.name}은(는) 10MB를 초과합니다.`, 'error');
        return;
      }

      selectedFiles.push(file);
      displayFile(file);
    });

    // 파일 입력 초기화
    this.value = '';
  });

  // 파일 표시
  function displayFile(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span class="file-name">${file.name}</span>
      <button class="remove-file" onclick="removeFile('${file.name}')">×</button>
    `;
    fileList.appendChild(fileItem);
  }

  // 파일 제거 (전역 함수로 등록)
  window.removeFile = function (fileName) {
    selectedFiles = selectedFiles.filter((file) => file.name !== fileName);
    updateFileList();
  };

  // 파일 목록 업데이트
  function updateFileList() {
    fileList.innerHTML = '';
    selectedFiles.forEach((file) => displayFile(file));
  }

  // 미리보기 기능
  previewBtn.addEventListener('click', function () {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
      showNotification('제목과 내용을 모두 입력해주세요.', 'error');
      return;
    }

    showPreview(title, content);
  });

  // 미리보기 모달 표시
  function showPreview(title, content) {
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
      <div class="preview-content">
        <div class="preview-header">
          <h3>게시글 미리보기</h3>
          <button class="close-preview">×</button>
        </div>
        <div class="preview-body">
          <h4 class="preview-title">${title}</h4>
          <div class="preview-meta">
            <span class="preview-author">익명</span>
            <span class="preview-time">방금 전</span>
          </div>
          <div class="preview-text">${content.replace(/\n/g, '<br>')}</div>
          ${
            selectedFiles.length > 0
              ? `
            <div class="preview-files">
              <h5>첨부파일 (${selectedFiles.length}개)</h5>
              <div class="file-preview-list">
                ${selectedFiles
                  .map(
                    (file) => `
                  <div class="file-preview-item">
                    <span class="file-icon">📎</span>
                    <span class="file-name">${file.name}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
        <div class="preview-footer">
          <button class="btn-secondary" onclick="closePreview()">닫기</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 닫기 버튼 이벤트
    modal
      .querySelector('.close-preview')
      .addEventListener('click', closePreview);

    // 배경 클릭 시 닫기
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closePreview();
      }
    });
  }

  // 미리보기 닫기 (전역 함수로 등록)
  window.closePreview = function () {
    const modal = document.querySelector('.preview-modal');
    if (modal) {
      modal.remove();
    }
  };

  // 폼 제출 처리
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const selectedBoard = document.querySelector(
      'input[name="board"]:checked'
    ).value;

    if (!title || !content) {
      showNotification('제목과 내용을 모두 입력해주세요.', 'error');
      return;
    }

    if (title.length < 5) {
      showNotification('제목은 5자 이상 입력해주세요.', 'error');
      return;
    }

    if (content.length < 10) {
      showNotification('내용은 10자 이상 입력해주세요.', 'error');
      return;
    }

    // 게시글 데이터 수집
    const postData = {
      board: selectedBoard,
      title: title,
      content: content,
      files: selectedFiles,
      anonymous: document.getElementById('anonymous').checked,
      allowComments: document.getElementById('allowComments').checked,
      notifyReplies: document.getElementById('notifyReplies').checked,
      timestamp: new Date().toISOString(),
    };

    // 실제 구현에서는 서버로 데이터 전송
    submitPost(postData);
  });

  // 게시글 제출
  function submitPost(postData) {
    // 로딩 상태 표시
    const submitBtn = form.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '게시 중...';
    submitBtn.disabled = true;

    // 시뮬레이션된 서버 요청
    setTimeout(() => {
      // 로컬 저장소에 저장
      try {
        const storageKey = 'campusTalkPosts';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const savedPost = {
          id:
            'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          board: postData.board,
          title: postData.title,
          content: postData.content,
          // File 객체는 저장할 수 없으므로 메타데이터만 보관
          files: (postData.files || []).map((f) => ({
            name: f.name,
            type: f.type,
            size: f.size,
          })),
          anonymous: !!postData.anonymous,
          allowComments: !!postData.allowComments,
          notifyReplies: !!postData.notifyReplies,
          timestamp: postData.timestamp || new Date().toISOString(),
          likes: 0,
          comments: 0,
          views: 0,
        };
        existing.push(savedPost);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      } catch (err) {
        // 저장 실패해도 흐름은 계속
        console.error('Failed to save post to localStorage:', err);
      }

      showNotification('게시글이 성공적으로 등록되었습니다!', 'success');

      // 성공 후 해당 게시판으로 이동
      const boardUrls = {
        free: 'free-board.html',
        class: 'class-info.html',
        exam: 'exam-info.html',
        job: 'job-info.html',
      };

      const targetUrl = boardUrls[postData.board];
      if (targetUrl) {
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1500);
      }
    }, 2000);
  }

  // 알림 표시
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // 스타일 추가
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${
        type === 'success'
          ? '#10b981'
          : type === 'error'
          ? '#ef4444'
          : '#2563eb'
      };
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 애니메이션
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // 자동 제거
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // 미리보기 모달 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    .preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    
    .preview-content {
      background: white;
      border-radius: 20px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .preview-header h3 {
      margin: 0;
      color: #333;
    }
    
    .close-preview {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      line-height: 1;
    }
    
    .preview-body {
      padding: 1.5rem;
    }
    
    .preview-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }
    
    .preview-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      color: #666;
      font-size: 0.9rem;
    }
    
    .preview-text {
      line-height: 1.6;
      color: #333;
      margin-bottom: 1.5rem;
    }
    
    .preview-files h5 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    .file-preview-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .file-preview-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f8fafc;
      border-radius: 8px;
      color: #666;
    }
    
    .preview-footer {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      text-align: right;
    }
  `;
  document.head.appendChild(style);
});

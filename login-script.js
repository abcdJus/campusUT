// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
  // 탭 전환 기능
  const tabBtns = document.querySelectorAll('.tab-btn');
  const authForms = document.querySelectorAll('.auth-form');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');

      // 모든 탭 버튼에서 active 클래스 제거
      tabBtns.forEach((b) => b.classList.remove('active'));
      // 모든 폼에서 active 클래스 제거
      authForms.forEach((f) => f.classList.remove('active'));

      // 클릭된 탭 버튼에 active 클래스 추가
      this.classList.add('active');
      // 해당하는 폼에 active 클래스 추가
      document.getElementById(targetTab + '-form').classList.add('active');
    });
  });

  // 로그인 폼 제출 처리
  const loginForm = document.querySelector('#login-form .form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const rememberMe = document.getElementById('remember-me').checked;

      // 간단한 유효성 검사
      if (!email || !password) {
        showNotification('이메일과 비밀번호를 모두 입력해주세요.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('올바른 이메일 형식을 입력해주세요.', 'error');
        return;
      }

      // 가입 여부 확인 및 인증
      const users = loadUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        showNotification(
          '가입된 계정을 찾을 수 없습니다. 먼저 회원가입을 진행해주세요.',
          'error'
        );
        const signupTab = document.querySelector('[data-tab="signup"]');
        if (signupTab) signupTab.click();
        return;
      }

      // 비밀번호 해시 비교 (기존 평문 계정 대비도 처리)
      const inputHash = await hashString(password);
      const matchesHash = user.passwordHash && user.passwordHash === inputHash;
      const matchesPlain = user.password && user.password === password;
      if (!matchesHash && !matchesPlain) {
        showNotification('비밀번호가 올바르지 않습니다.', 'error');
        return;
      }

      showNotification('로그인 처리 중...', 'info');

      setTimeout(() => {
        // 세션 저장
        setCurrentUser(
          {
            email: user.email,
            name: user.name,
            studentId: user.studentId,
            university: user.university,
            major: user.major,
            rememberMe,
          },
          rememberMe
        );
        showNotification('로그인 성공! 메인 페이지로 이동합니다.', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }, 600);
    });
  }

  // 회원가입 폼 제출 처리
  const signupForm = document.querySelector('#signup-form .form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('signup-name').value;
      const studentId = document.getElementById('signup-student-id').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const passwordConfirm = document.getElementById(
        'signup-password-confirm'
      ).value;
      const university = document.getElementById('signup-university').value;
      const major = document.getElementById('signup-major').value;
      const agreeTerms = document.getElementById('agree-terms').checked;

      // 유효성 검사
      if (
        !name ||
        !studentId ||
        !email ||
        !password ||
        !passwordConfirm ||
        !university ||
        !major
      ) {
        showNotification('모든 필수 항목을 입력해주세요.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('올바른 이메일 형식을 입력해주세요.', 'error');
        return;
      }

      if (password.length < 8) {
        showNotification('비밀번호는 8자 이상이어야 합니다.', 'error');
        return;
      }

      if (password !== passwordConfirm) {
        showNotification('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }

      if (!agreeTerms) {
        showNotification('이용약관에 동의해주세요.', 'error');
        return;
      }

      // 중복 가입 체크 및 저장
      const users = loadUsers();
      if (users.some((u) => u.email === email)) {
        showNotification('이미 가입된 이메일입니다. 로그인해주세요.', 'error');
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) loginTab.click();
        return;
      }

      showNotification('회원가입 처리 중...', 'info');

      setTimeout(() => {
        users.push({
          name,
          studentId,
          email,
          passwordHash: window.__pwHash || '',
          university,
          major,
          createdAt: new Date().toISOString(),
        });
        saveUsers(users);

        showNotification('회원가입 성공! 로그인해주세요.', 'success');
        // 로그인 탭으로 전환 및 이메일 프리필
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) loginTab.click();
        const loginEmail = document.getElementById('login-email');
        if (loginEmail) loginEmail.value = email;
        signupForm.reset();
      }, 700);

      // 비동기 해시 수행 (빠르게 계산해서 push 이전에 세팅될 수 있도록 시도)
      try {
        const hashed = await hashString(password);
        window.__pwHash = hashed;
      } catch (e) {
        window.__pwHash = '';
      }
    });
  }

  // 소셜 로그인 버튼 이벤트
  const socialBtns = document.querySelectorAll('.social-btn');
  socialBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const platform = this.classList.contains('google')
        ? 'Google'
        : this.classList.contains('kakao')
        ? 'Kakao'
        : 'Naver';

      showNotification(`${platform} 로그인 기능은 개발 중입니다.`, 'info');
    });
  });

  // 비밀번호 확인 실시간 검증
  const passwordInput = document.getElementById('signup-password');
  const passwordConfirmInput = document.getElementById(
    'signup-password-confirm'
  );

  if (passwordConfirmInput) {
    passwordConfirmInput.addEventListener('input', function () {
      if (passwordInput.value && this.value) {
        if (passwordInput.value === this.value) {
          this.style.borderColor = '#10b981';
        } else {
          this.style.borderColor = '#ef4444';
        }
      } else {
        this.style.borderColor = '#e2e8f0';
      }
    });
  }

  // 비밀번호 강도 표시
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      const strength = getPasswordStrength(this.value);
      updatePasswordStrengthIndicator(strength);
    });
  }

  // 비밀번호 재설정 모달
  const forgotLink = document.querySelector('.forgot-password');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      openResetModal();
    });
  }

  // 로컬 저장소 유틸
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem('campusTalkUsers') || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem('campusTalkUsers', JSON.stringify(users));
    } catch (e) {}
  }

  function setCurrentUser(user) {
    try {
      localStorage.setItem('campusTalkCurrentUser', JSON.stringify(user));
    } catch (e) {}
  }

  // 이메일 유효성 검사 함수
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 비밀번호 강도 계산 함수
  function getPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  // 비밀번호 강도 표시 업데이트
  function updatePasswordStrengthIndicator(strength) {
    const hint = document.querySelector('.password-hint');
    if (hint) {
      const colors = {
        weak: '#ef4444',
        medium: '#f59e0b',
        strong: '#10b981',
      };

      const messages = {
        weak: '8자 이상, 영문/숫자/특수문자 조합 (약함)',
        medium: '8자 이상, 영문/숫자/특수문자 조합 (보통)',
        strong: '8자 이상, 영문/숫자/특수문자 조합 (강함)',
      };

      hint.style.color = colors[strength];
      hint.textContent = messages[strength];
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
    }, 5000);
  }

  // 입력 필드 포커스 효과
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach((input) => {
    input.addEventListener('focus', function () {
      this.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function () {
      this.parentElement.style.transform = 'scale(1)';
    });
  });

  // 페이지 로드 시 애니메이션
  window.addEventListener('load', () => {
    const authBox = document.querySelector('.auth-box');
    if (authBox) {
      authBox.style.opacity = '0';
      authBox.style.transform = 'translateY(30px)';
      authBox.style.transition = 'all 0.6s ease';

      setTimeout(() => {
        authBox.style.opacity = '1';
        authBox.style.transform = 'translateY(0)';
      }, 100);
    }
  });

  // 해시 유틸
  async function hashString(input) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // 로컬 저장소 유틸
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem('campusTalkUsers') || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem('campusTalkUsers', JSON.stringify(users));
    } catch (e) {}
  }

  function setCurrentUser(user, remember) {
    try {
      if (remember) {
        localStorage.setItem('campusTalkCurrentUser', JSON.stringify(user));
        sessionStorage.removeItem('campusTalkCurrentUser');
      } else {
        sessionStorage.setItem('campusTalkCurrentUser', JSON.stringify(user));
        localStorage.removeItem('campusTalkCurrentUser');
      }
    } catch (e) {}
  }

  function openResetModal() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 10000;
      display: flex; align-items: center; justify-content: center;`;
    const modal = document.createElement('div');
    modal.style.cssText = `background:#fff; border-radius:16px; width: 90%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,.3);`;
    modal.innerHTML = `
      <div style="padding:20px 20px 12px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0;">비밀번호 재설정</h3>
        <button class="close-reset" style="background:none; border:none; font-size:20px; cursor:pointer; color:#666;">×</button>
      </div>
      <div style="padding:16px 20px; display:flex; flex-direction:column; gap:12px;">
        <label style="font-size:14px; color:#374151;">이메일</label>
        <input type="email" id="reset-email" placeholder="가입한 이메일" style="padding:10px 12px; border:1px solid #e5e7eb; border-radius:8px;"/>
        <label style="font-size:14px; color:#374151;">새 비밀번호</label>
        <input type="password" id="reset-pass" placeholder="새 비밀번호" style="padding:10px 12px; border:1px solid #e5e7eb; border-radius:8px;"/>
        <input type="password" id="reset-pass2" placeholder="비밀번호 확인" style="padding:10px 12px; border:1px solid #e5e7eb; border-radius:8px;"/>
      </div>
      <div style="padding:14px 20px; border-top:1px solid #e5e7eb; display:flex; justify-content:flex-end; gap:8px;">
        <button class="cancel-reset" style="background:#e5e7eb; color:#111827; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">취소</button>
        <button class="submit-reset" style="background:#2563eb; color:#fff; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">재설정</button>
      </div>`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    modal.querySelector('.close-reset').addEventListener('click', close);
    modal.querySelector('.cancel-reset').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    modal.querySelector('.submit-reset').addEventListener('click', async () => {
      const email = document.getElementById('reset-email').value.trim();
      const p1 = document.getElementById('reset-pass').value;
      const p2 = document.getElementById('reset-pass2').value;
      if (!email || !p1 || !p2) {
        showNotification('모든 항목을 입력해주세요.', 'error');
        return;
      }
      if (!isValidEmail(email)) {
        showNotification('올바른 이메일 형식이 아닙니다.', 'error');
        return;
      }
      if (p1.length < 8) {
        showNotification('비밀번호는 8자 이상이어야 합니다.', 'error');
        return;
      }
      if (p1 !== p2) {
        showNotification('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }

      const users = loadUsers();
      const idx = users.findIndex((u) => u.email === email);
      if (idx === -1) {
        showNotification('가입된 이메일이 아닙니다.', 'error');
        return;
      }

      const newHash = await hashString(p1);
      users[idx].passwordHash = newHash;
      delete users[idx].password; // 기존 평문 제거
      saveUsers(users);
      showNotification(
        '비밀번호가 재설정되었습니다. 로그인해주세요.',
        'success'
      );
      close();
      const loginTab = document.querySelector('[data-tab="login"]');
      if (loginTab) loginTab.click();
      const loginEmail = document.getElementById('login-email');
      if (loginEmail) loginEmail.value = email;
    });
  }
});

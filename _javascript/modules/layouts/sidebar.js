// === 사이드바 오픈/닫기 (네 기존 코드 유지) ===
const ATTR_DISPLAY = 'sidebar-display';
const $sidebar = document.getElementById('sidebar');
const $trigger = document.getElementById('sidebar-trigger');
const $mask = document.getElementById('mask');

class SidebarUtil {
  static #isExpanded = false;
  static toggle() {
    this.#isExpanded = !this.#isExpanded;
    document.body.toggleAttribute(ATTR_DISPLAY, this.#isExpanded);
    $sidebar?.classList.toggle('z-2', this.#isExpanded);
    $mask?.classList.toggle('d-none', !this.#isExpanded);
  }
}
export function initSidebar() {
  if ($trigger) $trigger.onclick = () => SidebarUtil.toggle();
  if ($mask) $mask.onclick = () => SidebarUtil.toggle();
}

// === 카테고리/서브카테고리 토글 바인딩 ===
function wireCategoryToggles(root = document) {
  // 0) 상단 CATEGORIES 토글 아이콘 초기 동기화
  const catList = root.getElementById('category-list');
  const catIcon = root.getElementById('toggle-icon');
  if (catList && catIcon) {
    const hidden = catList.classList.contains('d-none');
    catIcon.classList.toggle('fa-chevron-up', !hidden);
    catIcon.classList.toggle('fa-chevron-down', hidden);

    const catToggle = root.getElementById('toggle-categories');
    if (catToggle && !catToggle.dataset.wired) {
      catToggle.dataset.wired = '1';
      catToggle.addEventListener('click', () => {
        const nowHidden = catList.classList.toggle('d-none');
        catIcon.classList.toggle('fa-chevron-up', !nowHidden);
        catIcon.classList.toggle('fa-chevron-down', nowHidden);
      });
    }
  }

  // 1) 서브카테고리 트리거를 모두 수집
  root.querySelectorAll('#category-list a[data-bs-toggle="collapse"]').forEach(link => {
    if (link.dataset.wired) return; // 중복 방지
    link.dataset.wired = '1';

    // (a) 타겟 UL 찾기
    const sel = link.getAttribute('data-bs-target') || link.getAttribute('href');
    if (!sel || !sel.startsWith('#')) return;
    const target = root.querySelector(sel);
    if (!target) return;

    // (b) 화살표 아이콘 (우측 i.ms-2)
    const icon = link.querySelector('i.ms-2');

    // (c) 아이콘/접근성 상태 적용 헬퍼
    const setState = (expanded) => {
      link.setAttribute('aria-expanded', String(expanded));
      link.classList.toggle('collapsed', !expanded);
      if (icon) {
        icon.classList.toggle('fa-angle-up', expanded);
        icon.classList.toggle('fa-angle-down', !expanded);
      }
    };

    // (d) 초기 상태 동기화
    const initiallyExpanded = target.classList.contains('show');
    setState(initiallyExpanded);

    // (e) 부트스트랩 JS가 있으면 이벤트로 동기화
    if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Collapse) {
      target.addEventListener('show.bs.collapse', () => setState(true));
      target.addEventListener('hide.bs.collapse', () => setState(false));
    }

    // (f) 폴백: 부트스트랩 JS가 없어도 동작
    link.addEventListener('click', (e) => {
      // 해시 이동 방지
      e.preventDefault();
      // 부트스트랩 JS가 있으면 부트스트랩이 처리하게 두되, 아이콘만 맞춤
      if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Collapse) {
        // 부트스트랩이 show/hide 이벤트를 곧 쏘므로 여기선 즉시 토글 안 함
        const willExpand = !(link.getAttribute('aria-expanded') === 'true');
        setState(willExpand);
        return;
      }
      // 순수 JS로 접힘/펼침
      const expanded = link.getAttribute('aria-expanded') === 'true';
      const willExpand = !expanded;
      setState(willExpand);
      if (willExpand) {
        target.classList.add('show');
        target.classList.remove('collapse');
        target.style.height = 'auto';
      } else {
        target.classList.remove('show');
        target.classList.add('collapse');
        target.style.height = '';
      }
    });
  });
}

// === 초기화 타이밍 ===
// 모듈/지연로드/정적로드 모두 커버
function boot() {
  try { initSidebar(); } catch {}
  wireCategoryToggles(document);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// 터보링크/바로가기 등 재탑재 환경 지원(있다면)
window.addEventListener('pageshow', () => wireCategoryToggles(document));

const ATTR_DISPLAY = 'sidebar-display';
const $sidebar = document.getElementById('sidebar');
const $trigger = document.getElementById('sidebar-trigger');
const $mask = document.getElementById('mask');

class SidebarUtil {
  static #isExpanded = false;

  static toggle() {
    this.#isExpanded = !this.#isExpanded;
    document.body.toggleAttribute(ATTR_DISPLAY, this.#isExpanded);
    $sidebar.classList.toggle('z-2', this.#isExpanded);
    $mask.classList.toggle('d-none', !this.#isExpanded);
  }
  
}

export function initSidebar() {
  $trigger.onclick = $mask.onclick = () => SidebarUtil.toggle();
}

document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('toggle-categories');
  const categoryList = document.getElementById('category-list');
  const toggleIcon = document.getElementById('toggle-icon');

  toggleBtn.addEventListener('click', function () {
    categoryList.classList.toggle('d-none');
    toggleIcon.classList.toggle('fa-chevron-down');
    toggleIcon.classList.toggle('fa-chevron-up');
  });
});
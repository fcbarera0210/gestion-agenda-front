const duration = 300;

function handleLink(link) {
  link.addEventListener('click', (e) => {
    const url = link.getAttribute('href');
    if (!url || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (link.target && link.target !== '_self') || url.startsWith('#')) {
      return;
    }
    e.preventDefault();
    document.documentElement.classList.add('fade-out');
    setTimeout(() => {
      window.location.href = url;
    }, duration);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('fade-out');
  document.querySelectorAll('a[transition\\:animate="fade"], a[data-astro-transition="fade"]').forEach(handleLink);
});

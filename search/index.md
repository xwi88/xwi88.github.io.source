# 搜索 / Search


<div id="pagefind-search"></div>

> 💡 **Tip**:任意页面按 **Ctrl/Cmd + K** 可直接唤出搜索(无需进本页)。

<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>
<script>
  // Pagefind UI — client-side search over the build-time index (public/pagefind/).
  // No external service / account. Chinese-aware (Unicode segmentation).
  window.addEventListener('DOMContentLoaded', function () {
    new PagefindUI({
      element: '#pagefind-search',
      showSubResults: true,
      pageSize: 10,
      excerptLength: 15,
      translations: { placeholder: '搜索文章 / Search posts…' }
    });
  });
</script>


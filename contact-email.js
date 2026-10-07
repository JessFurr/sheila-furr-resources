// Assemble email links at load so the address never appears in the page source.
document.querySelectorAll('a.em[data-u]').forEach(function (a) {
  var addr = a.dataset.u + '@' + a.dataset.d;
  a.href = 'mailto:' + addr;
  if (!a.hasAttribute('data-keep')) a.textContent = addr;
});

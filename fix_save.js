const fs = require('fs');
let html = fs.readFileSync('C:/Users/29763/github-family-tree/index.html', 'utf8');

// Fix: onBgFileSelected - compress background images
const bgStart = 'function onBgFileSelected(e) {';
const bgEnd = 'function clearBgImage(page)';

const bgIdx = html.indexOf(bgStart);
const bgEndIdx = html.indexOf(bgEnd, bgIdx);
if (bgIdx >= 0 && bgEndIdx >= 0) {
  const newBgFn = `function onBgFileSelected(e) {
  if (!e.target.files || !e.target.files[0]) return;
  var file = e.target.files[0];
  var cb = function(dataUrl) {
    var cap = bgPendingPage.charAt(0).toUpperCase() + bgPendingPage.slice(1);
    config['bg' + cap] = dataUrl;
    saveData('ft_config', config);
    updateBgThumb(bgPendingPage);
    applyPageBg(bgPendingPage, dataUrl);
    if (bgPendingPage === 'hero') applyHeroBg(dataUrl);
    bgPendingPage = '';
    e.target.value = '';
  };
  compressBgImage(file, cb);
}
`;
  html = html.substring(0, bgIdx) + newBgFn + html.substring(bgEndIdx);
  console.log('Fixed onBgFileSelected');
}

// Fix: handleAlbumUpload - compress album photos
const albumStart = 'function handleAlbumUpload(e) {';
const albumEnd = 'function deleteAlbumPhoto(memberId';

const albIdx = html.indexOf(albumStart);
const albEndIdx = html.indexOf(albumEnd, albIdx);
if (albIdx >= 0 && albEndIdx >= 0) {
  const newAlbumFn = `function handleAlbumUpload(e) {
  const memberId = parseInt(e.target.dataset.memberId);
  const files = Array.from(e.target.files);
  if(!files.length) return;
  let loaded = 0;
  files.forEach(file => {
    if(file.size > 5 * 1024 * 1024) { showToast('单张图片不能超过 5MB', 'error'); return; }
    compressImage(file, function(dataUrl) {
      const m = members.find(x => x.id === memberId);
      if(!m) return;
      if(!m.album) m.album = [];
      m.album.push({ url: dataUrl, caption: '' });
      loaded++;
      if(loaded === files.length) {
        saveData('ft_members', members);
        renderAlbumGrid(memberId);
        showToast('已添加 ' + loaded + ' 张照片', 'success');
      }
    });
  });
  e.target.value = '';
}
`;
  html = html.substring(0, albIdx) + newAlbumFn + html.substring(albEndIdx);
  console.log('Fixed handleAlbumUpload');
}

// Add compressBgImage function (higher quality for backgrounds)
const compressBgFunc = `function compressBgImage(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var maxW = 800, maxH = 800;
      var w = img.width, h = img.height;
      if (w <= maxW && h <= maxH) { callback(e.target.result); return; }
      var ratio = Math.min(maxW / w, maxH / h);
      var cw = Math.round(w * ratio), ch = Math.round(h * ratio);
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cw, ch);
      callback(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
`;

if (!html.includes('function compressBgImage')) {
  const marker = 'function compressImage(file, callback) {';
  html = html.replace(marker, compressBgFunc + marker);
  console.log('Added compressBgImage');
}

// Count remaining readAsDataURL calls
const remaining = (html.match(/reader\.readAsDataURL\(file\)/g) || []);
console.log('Remaining readAsDataURL:', remaining.length);

fs.writeFileSync('C:/Users/29763/github-family-tree/index.html', html);
console.log('Done');

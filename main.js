// hi.tahayerdekalmazer.com — kartvizit sayfası
(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // Giriş sırası: kartın çocukları ve bağlantı satırları kademeli gelir
  [...document.querySelectorAll('.card > *')].forEach((el, i) => el.style.setProperty('--i', i));
  [...document.querySelectorAll('.row')].forEach((el, i) => el.style.setProperty('--r', i));
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('in')));

  document.getElementById('yr').textContent = new Date().getFullYear();

  // ── Dil ───────────────────────────────────────────────
  const T = {
    tr: { saved: 'Kişi kartı indirildi', copied: 'E-posta kopyalandı', linkCopied: 'Bağlantı kopyalandı', mail: 'E-posta' },
    en: { saved: 'Contact card downloaded', copied: 'Email copied', linkCopied: 'Link copied', mail: 'Email' },
  };
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  let lang = read('hi-lang') || ((navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en');

  const langBtn = document.querySelector('.lang');
  function applyLang() {
    root.lang = lang;
    document.querySelectorAll('[data-tr]').forEach(el => { el.textContent = el.dataset[lang]; });
    document.querySelectorAll('[data-href-tr]').forEach(el => { el.href = el.dataset['href' + (lang === 'tr' ? 'Tr' : 'En')]; });
    const mail = document.querySelector('[data-copy] .row__t b');
    if (mail) mail.textContent = T[lang].mail;
    langBtn.textContent = lang === 'tr' ? 'EN' : 'TR';
  }
  langBtn.addEventListener('click', () => { lang = lang === 'tr' ? 'en' : 'tr'; write('hi-lang', lang); applyLang(); });
  applyLang();

  // ── Bildirim ──────────────────────────────────────────
  const toast = document.querySelector('.toast');
  let tt;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove('on'), 1900);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    }
  }

  // ── Rehbere kaydet (vCard) ────────────────────────────
  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0',
    'N:Yerdekalmazer;Taha;;;', 'FN:Taha Yerdekalmazer',
    'TITLE:Digital Product Developer · Product Designer',
    'EMAIL;TYPE=INTERNET:tyerdekalmazer01@gmail.com',
    'URL:https://www.tahayerdekalmazer.com/',
    'URL:https://www.linkedin.com/in/tyerdekalmazer/',
    'URL:https://github.com/yerdekalmazer',
    'ADR;TYPE=WORK:;;;Konya;;;Türkiye',
    'NOTE:hi.tahayerdekalmazer.com',
    'END:VCARD',
  ].join('\r\n');

  // Rehber kartına fotoğraf da girsin (base64, satır katlamalı)
  let photo = '';
  fetch('img/taha.jpg').then(r => r.blob()).then(b => new Promise(ok => {
    const fr = new FileReader(); fr.onload = () => ok(fr.result.split(',')[1]); fr.readAsDataURL(b);
  })).then(b64 => { photo = 'PHOTO;ENCODING=b;TYPE=JPEG:' + b64.match(/.{1,74}/g).join('\r\n '); }).catch(() => {});

  document.getElementById('save').addEventListener('click', e => {
    e.preventDefault();
    const card = photo ? vcf.replace('END:VCARD', photo + '\r\nEND:VCARD') : vcf;
    const url = URL.createObjectURL(new Blob([card], { type: 'text/vcard;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'Taha-Yerdekalmazer.vcf' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    say(T[lang].saved);
  });

  // ── Paylaş ────────────────────────────────────────────
  document.getElementById('share').addEventListener('click', async () => {
    const data = { title: 'Taha Yerdekalmazer', url: 'https://hi.tahayerdekalmazer.com/' };
    if (navigator.share) { try { await navigator.share(data); } catch {} return; }
    if (await copy(data.url)) say(T[lang].linkCopied);
  });

  // ── E-posta: satır posta açar, "Kopyala" rozeti kopyalar ──
  document.querySelector('.row__a--copy').addEventListener('click', async e => {
    e.preventDefault(); e.stopPropagation();
    if (await copy(e.currentTarget.closest('[data-copy]').dataset.copy)) say(T[lang].copied);
  });
})();

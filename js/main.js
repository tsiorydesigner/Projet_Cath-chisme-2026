let students = JSON.parse(localStorage.getItem('eleves') || '[]');
let editingId = null;
let viewMode = 'grid';
let currentPhoto = null;
let currentFilter = 'all';

function filterStudents(filter) {
  currentFilter = filter;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  renderStudents();
}

function generateId() {
  return 'EL-' + Date.now().toString(36).toUpperCase();
}

function setView(mode) {
  viewMode = mode;
  document.getElementById('btnGrid').classList.toggle('active', mode === 'grid');
  document.getElementById('btnList').classList.toggle('active', mode === 'list');
  renderStudents();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function calcAge(dateStr) {
  if (!dateStr) return '';
  const birth = new Date(dateStr);
  const age = Math.floor((Date.now() - birth) / (365.25 * 24 * 3600 * 1000));
  return `${age} ans`;
}

function getPhotoDisplay(student, size = 'card') {
  if (student.photo) {
    return `<img src="${student.photo}" alt="photo">`;
  }
  return size === 'card' ? '👤' : '👤';
}

function renderStudents() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  let filtered = students.filter(s =>
    `${s.nom} ${s.prenom} ${s.lieuNaissance}`.toLowerCase().includes(query)
  );

  // Apply category filter
  if (currentFilter === 'garcons') {
    filtered = filtered.filter(s => s.sexe === 'M');
  } else if (currentFilter === 'filles') {
    filtered = filtered.filter(s => s.sexe === 'F');
  } else if (currentFilter === 'actifs') {
    filtered = filtered.filter(s => s.statut !== 'inactif');
  } else if (currentFilter === 'inactifs') {
    filtered = filtered.filter(s => s.statut === 'inactif');
  }

  // Stats
  document.getElementById('statTotal').textContent = students.length;
  document.getElementById('statGarcons').textContent = students.filter(s => s.sexe === 'M').length;
  document.getElementById('statFilles').textContent = students.filter(s => s.sexe === 'F').length;

  const container = document.getElementById('studentsContainer');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📋</div>
        <h3>${students.length === 0 ? 'Aucun élève enregistré' : 'Aucun résultat'}</h3>
        <p>${students.length === 0 ? 'Cliquez sur "Ajouter un élève" pour commencer.' : 'Essayez un autre terme de recherche.'}</p>
      </div>`;
    return;
  }

  if (viewMode === 'grid') {
    container.innerHTML = `<div class="students-grid">${filtered.map(s => `
      <div class="student-card">
        <div class="card-photo" onclick="openDetail('${s.id}')">
          ${s.photo ? `<img src="${s.photo}" alt="photo">` : '👤'}
        </div>
        <div class="card-body" onclick="openDetail('${s.id}')">
          <div class="card-name">${s.nom} ${s.prenom}</div>
          <div class="card-info">📅 ${formatDate(s.dateNaissance)} · ${calcAge(s.dateNaissance)}</div>
          <div class="card-info">📍 ${s.lieuNaissance || '—'}</div>
          <div class="card-info">📞 ${s.telephone || '—'}</div>
        </div>
        <div class="card-actions">
          <button class="btn-sm edit" onclick="openEdit('${s.id}')">✏️ Modifier</button>
          <button class="btn-sm del" onclick="deleteStudent('${s.id}')">🗑️ Supprimer</button>
        </div>
      </div>`).join('')}</div>`;
  } else {
    container.innerHTML = `<div class="students-list">
      <div class="student-row" style="background:var(--ink);color:white;cursor:default;pointer-events:none;font-size:0.8rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
        <div></div><div>Élève</div><div>Date / Lieu</div><div>Téléphone</div><div>Actions</div>
      </div>
      ${filtered.map(s => `
      <div class="student-row">
        <div class="row-avatar" onclick="openDetail('${s.id}')">
          ${s.photo ? `<img src="${s.photo}" alt="photo">` : '👤'}
        </div>
        <div onclick="openDetail('${s.id}')">
          <div class="row-name">${s.nom} ${s.prenom}</div>
          <div class="row-meta">${s.sexe === 'M' ? '♂' : s.sexe === 'F' ? '♀' : '—'} · ID: ${s.id}</div>
        </div>
        <div onclick="openDetail('${s.id}')">
          <div class="row-name" style="font-size:0.9rem">${formatDate(s.dateNaissance)}</div>
          <div class="row-meta">${s.lieuNaissance || '—'}</div>
        </div>
        <div onclick="openDetail('${s.id}')">
          <div class="row-name" style="font-size:0.9rem">${s.telephone || '—'}</div>
          <div class="row-meta">Père: ${s.telPere || '—'}</div>
        </div>
        <div class="row-actions">
          <button class="btn-sm edit" onclick="openEdit('${s.id}')">✏️</button>
          <button class="btn-sm del" onclick="deleteStudent('${s.id}')">🗑️</button>
        </div>
      </div>`).join('')}
    </div>`;
  }
}

function openAddModal() {
  editingId = null;
  currentPhoto = null;
  document.getElementById('modalTitle').textContent = 'Nouvel Élève';
  ['fNom','fPrenom','fDateNaissance','fLieuNaissance','fTelephone','fNomPere','fNomMere','fTelPere','fTelMere'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fSexe').value = '';
  document.getElementById('photoImg').style.display = 'none';
  document.getElementById('photoPlaceholder').style.display = 'block';
  openModal('formModal');
}

function openEdit(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  editingId = id;
  currentPhoto = s.photo || null;
  document.getElementById('modalTitle').textContent = 'Modifier l\'élève';
  document.getElementById('fNom').value = s.nom || '';
  document.getElementById('fPrenom').value = s.prenom || '';
  document.getElementById('fDateNaissance').value = s.dateNaissance || '';
  document.getElementById('fLieuNaissance').value = s.lieuNaissance || '';
  document.getElementById('fTelephone').value = s.telephone || '';
  document.getElementById('fNomPere').value = s.nomPere || '';
  document.getElementById('fNomMere').value = s.nomMere || '';
  document.getElementById('fTelPere').value = s.telPere || '';
  document.getElementById('fTelMere').value = s.telMere || '';
  document.getElementById('fSexe').value = s.sexe || '';

  if (s.photo) {
    document.getElementById('photoImg').src = s.photo;
    document.getElementById('photoImg').style.display = 'block';
    document.getElementById('photoPlaceholder').style.display = 'none';
  } else {
    document.getElementById('photoImg').style.display = 'none';
    document.getElementById('photoPlaceholder').style.display = 'block';
  }
  closeModal('detailModal');
  openModal('formModal');
}

function openDetail(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-photo">
      ${s.photo ? `<img src="${s.photo}" alt="photo">` : '👤'}
    </div>
    <div class="detail-name">${s.nom} ${s.prenom}</div>
    <div class="detail-id">ID: ${s.id} · ${s.sexe === 'M' ? 'Garçon' : s.sexe === 'F' ? 'Fille' : ''}</div>
    <div class="detail-grid">
      <div class="detail-item">
        <div class="label">📅 Date de naissance</div>
        <div class="value">${formatDate(s.dateNaissance)}</div>
      </div>
      <div class="detail-item">
        <div class="label">🎂 Âge</div>
        <div class="value">${calcAge(s.dateNaissance)}</div>
      </div>
      <div class="detail-item">
        <div class="label">📍 Lieu de naissance</div>
        <div class="value">${s.lieuNaissance || '—'}</div>
      </div>
      <div class="detail-item">
        <div class="label">📞 Téléphone</div>
        <div class="value">${s.telephone || '—'}</div>
      </div>
      <div class="detail-item">
        <div class="label">👨 Père</div>
        <div class="value">${s.nomPere || '—'}</div>
      </div>
      <div class="detail-item">
        <div class="label">📞 Tél. père</div>
        <div class="value">${s.telPere || '—'}</div>
      </div>
      <div class="detail-item">
        <div class="label">👩 Mère</div>
        <div class="value">${s.nomMere || '—'}</div>
      </div>
      <div class="detail-item">
        <div class="label">📞 Tél. mère</div>
        <div class="value">${s.telMere || '—'}</div>
      </div>
    </div>
  `;

  document.getElementById('detailEditBtn').onclick = () => openEdit(id);
  document.getElementById('detailPdfBtn').onclick = () => exportFichesPDF([s]);
  openModal('detailModal');
}

function saveStudent() {
  const nom = document.getElementById('fNom').value.trim();
  const prenom = document.getElementById('fPrenom').value.trim();
  const dateNaissance = document.getElementById('fDateNaissance').value;
  const lieuNaissance = document.getElementById('fLieuNaissance').value.trim();

  if (!nom || !prenom) {
    showToast('⚠️ Nom et prénom sont obligatoires', 'error');
    return;
  }

  // On définit l'ID explicitement pour éviter toute ambiguïté
  const finalId = editingId || generateId();

  const data = {
    id: finalId,
    nom: nom.toUpperCase(),
    prenom,
    dateNaissance,
    lieuNaissance,
    sexe: document.getElementById('fSexe').value,
    telephone: document.getElementById('fTelephone').value.trim(),
    nomPere: document.getElementById('fNomPere').value.trim(),
    nomMere: document.getElementById('fNomMere').value.trim(),
    telPere: document.getElementById('fTelPere').value.trim(),
    telMere: document.getElementById('fTelMere').value.trim(),
    photo: currentPhoto
  };

  if (editingId) {
    const idx = students.findIndex(s => s.id === finalId);
    students[idx] = data;
    showToast('✅ Élève modifié avec succès', 'success');
  } else {
    students.push(data);
    showToast('✅ Élève ajouté avec succès', 'success');
  }

  localStorage.setItem('eleves', JSON.stringify(students));
  closeModal('formModal');
  renderStudents();
}

function deleteStudent(id) {
  if (!confirm('Voulez-vous vraiment supprimer cet élève ?')) return;
  // On force la conversion en String pour assurer une comparaison stricte exacte
  students = students.filter(s => String(s.id) !== String(id));
  localStorage.setItem('eleves', JSON.stringify(students));
  renderStudents();
  showToast('🗑️ Élève supprimé', 'error');
}

function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('⚠️ Photo trop grande (max 2MB)', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    currentPhoto = e.target.result;
    document.getElementById('photoImg').src = currentPhoto;
    document.getElementById('photoImg').style.display = 'block';
    document.getElementById('photoPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close on backdrop click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) el.classList.remove('open');
  });
});

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Seed data
if (students.length === 0) {
  students = [
    { id: 'EL-DEMO1', nom: 'DUPONT', prenom: 'Marie', dateNaissance: '2010-03-15', lieuNaissance: 'Paris', sexe: 'F', telephone: '06 12 34 56 78', nomPere: 'Jean DUPONT', nomMere: 'Sophie MARTIN', telPere: '06 11 22 33 44', telMere: '06 55 66 77 88', photo: null },
    { id: 'EL-DEMO2', nom: 'BERNARD', prenom: 'Lucas', dateNaissance: '2009-07-22', lieuNaissance: 'Lyon', sexe: 'M', telephone: '07 98 76 54 32', nomPere: 'Pierre BERNARD', nomMere: 'Claire RICHARD', telPere: '06 10 20 30 40', telMere: '06 50 60 70 80', photo: null },
    { id: 'EL-DEMO3', nom: 'LEFEVRE', prenom: 'Emma', dateNaissance: '2011-11-08', lieuNaissance: 'Marseille', sexe: 'F', telephone: '06 45 67 89 01', nomPere: 'Paul LEFEVRE', nomMere: 'Anne DUBOIS', telPere: '07 11 22 33 44', telMere: '07 55 66 77 88', photo: null }
  ];
  localStorage.setItem('eleves', JSON.stringify(students));
}

renderStudents();

// ── PDF EXPORT ────────────────────────────────────────────────────────────────

function togglePdfDropdown() {
  document.getElementById('pdfDropdown').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.pdf-wrapper')) {
    document.getElementById('pdfDropdown').classList.remove('open');
  }
});

function drawPdfHeader(doc, title) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, W, 22, 'F');
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.setTextColor(196, 154, 42);
  doc.text('ElevesGestion', 12, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(title, W - 12, 14, { align: 'right' });
  doc.setTextColor(0);
  return 30;
}

function addPdfFooters(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5); doc.setTextColor(160);
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}  |  Page ${i} / ${total}`, W / 2, H - 5, { align: 'center' });
    doc.setTextColor(0);
  }
}

// 1 — Liste complete (tableau)
function exportListePDF() {
  document.getElementById('pdfDropdown').classList.remove('open');
  if (students.length === 0) { showToast('Aucun eleve a exporter', 'error'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });
  let y = drawPdfHeader(doc, 'Liste des eleves');

  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('Liste complete des eleves', 14, y);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120);
  doc.text(`${students.length} eleve(s) enregistre(s)`, 14, y + 6);
  doc.setTextColor(0);

  doc.autoTable({
    startY: y + 14,
    head: [['#', 'Nom & Prenom', 'Sexe', 'Date naiss.', 'Lieu naiss.', 'Telephone', 'Pere', 'Mere']],
    body: students.map((s, i) => [
      i + 1,
      `${s.nom} ${s.prenom}`,
      s.sexe === 'M' ? 'Garcon' : s.sexe === 'F' ? 'Fille' : '-',
      formatDate(s.dateNaissance),
      s.lieuNaissance || '-',
      s.telephone || '-',
      s.nomPere || '-',
      s.nomMere || '-'
    ]),
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [13, 17, 23], textColor: [196, 154, 42], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 245, 238] },
    columnStyles: { 0: { cellWidth: 8 } }
  });

  addPdfFooters(doc);
  doc.save(`liste-eleves-${new Date().toISOString().slice(0,10)}.pdf`);
  showToast('Liste PDF exportee !', 'success');
}

// 2 — Fiches individuelles
function exportFichesPDF(subset) {
  document.getElementById('pdfDropdown').classList.remove('open');
  const list = subset || students;
  if (list.length === 0) { showToast('Aucun eleve a exporter', 'error'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();

  list.forEach((s, idx) => {
    if (idx > 0) doc.addPage();
    let y = drawPdfHeader(doc, `Fiche ${idx + 1}/${list.length}`);

    // Photo
    const photoX = W - 50, photoY = y, photoW = 36, photoH = 36;
    if (s.photo) {
      try {
        doc.addImage(s.photo, 'JPEG', photoX, photoY, photoW, photoH);
      } catch(e) {
        doc.setFillColor(237, 232, 219);
        doc.rect(photoX, photoY, photoW, photoH, 'F');
      }
    } else {
      doc.setFillColor(237, 232, 219);
      doc.rect(photoX, photoY, photoW, photoH, 'F');
      doc.setFontSize(9); doc.setTextColor(150);
      doc.text('Pas de photo', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
      doc.setTextColor(0);
    }
    doc.setDrawColor(200, 191, 168);
    doc.rect(photoX, photoY, photoW, photoH);

    // Name
    doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(13, 17, 23);
    doc.text(`${s.nom} ${s.prenom}`, 14, y + 10);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(130);
    doc.text(`ID: ${s.id}  |  ${s.sexe === 'M' ? 'Garcon' : s.sexe === 'F' ? 'Fille' : 'Sexe non renseigne'}`, 14, y + 18);
    doc.setTextColor(0);

    y += 44;
    doc.setDrawColor(200, 191, 168);
    doc.line(14, y, W - 14, y);
    y += 10;

    // Section helper
    const section = (title, rows) => {
      doc.setFillColor(237, 232, 219);
      doc.rect(14, y - 5, W - 28, 7, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 99, 85);
      doc.text(title, 17, y);
      doc.setTextColor(0);
      let fy = y + 8;
      rows.forEach(row => {
        const cW = (W - 28) / row.length;
        row.forEach((f, ci) => {
          const fx = 14 + ci * cW;
          doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(140);
          doc.text(f.label, fx, fy);
          doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(13, 17, 23);
          doc.text(f.value || '-', fx, fy + 5);
        });
        fy += 15;
      });
      y = fy + 4;
    };

    section('INFORMATIONS PERSONNELLES', [
      [{ label: 'Date de naissance', value: formatDate(s.dateNaissance) }, { label: 'Lieu de naissance', value: s.lieuNaissance }],
      [{ label: 'Sexe', value: s.sexe === 'M' ? 'Masculin' : s.sexe === 'F' ? 'Feminin' : '-' }, { label: 'Telephone', value: s.telephone }]
    ]);

    section('INFORMATIONS DES PARENTS', [
      [{ label: 'Nom du pere', value: s.nomPere }, { label: 'Telephone pere', value: s.telPere }],
      [{ label: 'Nom de la mere', value: s.nomMere }, { label: 'Telephone mere', value: s.telMere }]
    ]);
  });

  addPdfFooters(doc);
  doc.save(`fiches-eleves-${new Date().toISOString().slice(0,10)}.pdf`);
  showToast('Fiches PDF exportees !', 'success');
}

// 3 — Rapport statistiques
function exportStatsPDF() {
  document.getElementById('pdfDropdown').classList.remove('open');
  if (students.length === 0) { showToast('Aucun eleve a exporter', 'error'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  let y = drawPdfHeader(doc, 'Rapport statistiques');

  const total = students.length;
  const garcons = students.filter(s => s.sexe === 'M').length;
  const filles = students.filter(s => s.sexe === 'F').length;
  const avecPhoto = students.filter(s => s.photo).length;
  const avecTel = students.filter(s => s.telephone).length;

  doc.setFontSize(15); doc.setFont('helvetica', 'bold');
  doc.text('Rapport statistiques - Eleves', 14, y);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(130);
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`, 14, y + 7);
  doc.setTextColor(0);
  y += 18;

  // KPI cards
  const kpis = [
    { label: 'Total eleves', val: total, r: 42, g: 107, b: 200 },
    { label: 'Garcons', val: garcons, r: 200, g: 82, b: 42 },
    { label: 'Filles', val: filles, r: 196, g: 154, b: 42 },
    { label: 'Avec photo', val: avecPhoto, r: 26, g: 122, b: 74 }
  ];
  const cW = (W - 28 - 9) / 4;
  kpis.forEach((k, i) => {
    const cx = 14 + i * (cW + 3);
    // Background
    doc.setFillColor(k.r + 180, k.g + 100, k.b + 100);
    doc.rect(cx, y, cW, 22, 'F');
    // Top band
    doc.setFillColor(k.r, k.g, k.b);
    doc.rect(cx, y, cW, 7, 'F');
    // Label
    doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255);
    doc.text(k.label.toUpperCase(), cx + cW / 2, y + 5, { align: 'center' });
    // Value
    doc.setFontSize(18); doc.setTextColor(k.r, k.g, k.b);
    doc.text(String(k.val), cx + cW / 2, y + 18, { align: 'center' });
    doc.setTextColor(0);
  });
  y += 30;

  // Bar chart
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Repartition par sexe', 14, y); y += 7;

  const bars = [
    { label: 'Garcons', val: garcons, r: 42, g: 107, b: 200 },
    { label: 'Filles', val: filles, r: 196, g: 154, b: 42 },
    { label: 'Non renseigne', val: total - garcons - filles, r: 180, g: 180, b: 180 }
  ];
  bars.forEach(b => {
    const barW = total > 0 ? (b.val / total) * 90 : 0;
    doc.setFillColor(237, 232, 219); doc.rect(52, y, 90, 12, 'F');
    if (barW > 0) { doc.setFillColor(b.r, b.g, b.b); doc.rect(52, y, barW, 12, 'F'); }
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
    doc.text(b.label, 14, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${b.val}  (${total > 0 ? Math.round(b.val/total*100) : 0}%)`, 145, y + 8);
    y += 16;
  });
  y += 6;

  // Other stats
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('Completude des donnees', 14, y); y += 7;

  const completude = [
    { label: 'Numero de telephone renseigne', val: avecTel },
    { label: 'Photo de profil ajoutee', val: avecPhoto },
    { label: 'Nom du pere renseigne', val: students.filter(s => s.nomPere).length },
    { label: 'Nom de la mere renseigne', val: students.filter(s => s.nomMere).length }
  ];
  completude.forEach(c => {
    const pct = total > 0 ? Math.round(c.val / total * 100) : 0;
    const bW = (pct / 100) * 90;
    doc.setFillColor(237, 232, 219); doc.rect(120, y, 90, 8, 'F');
    doc.setFillColor(26, 122, 74); doc.rect(120, y, bW, 8, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
    doc.text(c.label, 14, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`${c.val}/${total} (${pct}%)`, 215, y + 6, { align: 'right' });
    y += 12;
  });
  y += 6;

  // Mini table
  doc.autoTable({
    startY: y,
    head: [['Nom & Prenom', 'Sexe', 'Date naiss.', 'Lieu naiss.', 'Tel.']],
    body: students.map(s => [
      `${s.nom} ${s.prenom}`,
      s.sexe === 'M' ? 'G' : s.sexe === 'F' ? 'F' : '-',
      formatDate(s.dateNaissance),
      s.lieuNaissance || '-',
      s.telephone || '-'
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [13, 17, 23], textColor: [196, 154, 42], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 245, 238] }
  });

  addPdfFooters(doc);
  doc.save(`rapport-statistiques-${new Date().toISOString().slice(0,10)}.pdf`);
  showToast('Rapport statistiques exporte !', 'success');
}
let dictionaryData = [];

// 1. ตรวจสอบคุ้กกี้และเริ่มระบบ
function checkConsent() {
    const consent = localStorage.getItem('cookie_consent');
    const banner = document.getElementById('cookie-banner');
    if (consent === 'accepted') {
        if (banner) banner.style.display = 'none';
        loadData(); 
    } else {
        if (banner) banner.style.display = 'flex';
    }
}

// 2. โหลดข้อมูลจาก API (โหลดเก็บไว้ใน memory ไม่โชว์ทันที)
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        // ไม่สั่ง renderResults(dictionaryData) ตรงนี้ เพื่อให้หน้าจอว่าง
    } catch (err) {
        console.error("Load Error:", err);
    }
}

// 3. ฟังก์ชันค้นหา (หาจากทุกช่อง แต่โชว์เฉพาะผลที่ตรง)
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    if (!query) {
        resultsDiv.innerHTML = ''; // ถ้าลบคำค้นหา หน้าจอต้องกลับมาว่าง
        return;
    }

    const cleanQuery = query.replace('#', '');

    const filtered = dictionaryData.filter(item => {
        // รวมทุกฟิลด์เข้าด้วยกันเพื่อค้นหา
        const searchableText = [
            item.word, item.meaning, item.define, item.pos, 
            item.note, item.refer, item.tag, item.keyword, item.misspelled
        ].join(" ").toLowerCase();
        
        return searchableText.includes(cleanQuery);
    });

    renderResults(filtered);
}

// 4. ฟังก์ชันแสดงผล (โชว์ 6 ช่อง: word, meaning, define, pos, note, refer)
function renderResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบคำศัพท์ที่ใกล้เคียง</div>' : '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="word-header">
                <div class="word-group">
                    <span class="word">${item.word || ''}</span>
                    <span class="pos">${item.pos || ''}</span>
                </div>
                <div class="meaning">${item.meaning || ''}</div>
            </div>
            <div class="definition">${item.define || ''}</div>
            ${item.note ? `<div class="note"><strong>Note:</strong> ${item.note}</div>` : ''}
            ${item.refer ? `<div class="refer" style="font-size: 0.85em; color: #888; margin-top: 12px; border-top: 1px solid #eee; padding-top: 8px;">อ้างอิง: ${item.refer}</div>` : ''}
        `;
        resultsDiv.appendChild(div);
    });
}

// ปุ่มคุ้กกี้และ Feedback (ส่วนเดิม)
function acceptCookie() { localStorage.setItem('cookie_consent', 'accepted'); checkConsent(); }
function declineCookie() { window.location.href = "https://www.google.com"; }
async function sendFeedback() {
    const text = document.getElementById('feedback-text').value.trim();
    if (!text) return alert("กรุณาพิมพ์ข้อความก่อนส่งนะครับ");
    try {
        await fetch('/api/submit-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
        document.getElementById('feedback-text').value = '';
        document.getElementById('feedback-msg').style.display = 'block';
    } catch (e) { alert("เกิดข้อผิดพลาด"); }
}

window.onload = checkConsent;

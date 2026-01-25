let dictionaryData = [];

// 1. ฟังก์ชันค้นหา (ย้ายขึ้นมาข้างบนเพื่อให้แน่ใจว่าถูกสร้างก่อนเรียกใช้)
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    if (!query) {
        resultsDiv.innerHTML = ''; 
        return;
    }

    const cleanQuery = query.replace('#', '');

    const filtered = dictionaryData.filter(item => {
        // ค้นหาทุกฟิลด์รวมถึงที่ซ่อนอยู่ (Tag, Misspelled, Note)
        const searchableText = [
            item.word, item.meaning, item.define, item.pos, 
            item.note, item.refer, item.tag, item.keyword, item.misspelled
        ].join(" ").toLowerCase();
        
        return searchableText.includes(cleanQuery);
    });

    renderResults(filtered);
}

// 2. ฟังก์ชันแสดงผล
function renderResults(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
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

// 3. ฟังก์ชันโหลดข้อมูล
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
    } catch (err) {
        console.error("Load Error:", err);
    }
}

// 4. ฟังก์ชันจัดการ Cookie (ตัวการที่เกิด Error เมื่อกี้)
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

function acceptCookie() {
    localStorage.setItem('cookie_consent', 'accepted');
    checkConsent();
}

function declineCookie() {
    window.location.href = "https://www.google.com";
}

// 5. ฟังก์ชันส่ง Feedback
async function sendFeedback() {
    const text = document.getElementById('feedback-text').value.trim();
    if (!text) return alert("กรุณาพิมพ์ข้อความก่อนส่งนะครับ");
    try {
        await fetch('/api/submit-feedback', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ message: text }) 
        });
        document.getElementById('feedback-text').value = '';
        document.getElementById('feedback-msg').style.display = 'block';
    } catch (e) { alert("เกิดข้อผิดพลาด"); }
}

// 6. จุดเริ่มทำงาน (เรียกใช้ checkConsent หลังจากโหลดหน้าเสร็จ)
window.onload = function() {
    checkConsent();
};

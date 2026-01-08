let dictionaryData = [];
const resultsDiv = document.getElementById('results');

// 1. โหลดข้อมูลจาก API
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        console.log("✅ ข้อมูลจาก DB โหลดแล้ว:", dictionaryData); // ดูข้อมูลใน Console
    } catch (err) {
        console.error("❌ โหลดข้อมูลล้มเหลว:", err);
    }
}

// 2. ฟังก์ชันค้นหา (ปรับให้ตรงกับหัวตาราง term, meaning, keyword, tag)
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    if (!query) { 
        resultsDiv.innerHTML = ''; 
        return; 
    }

    const filtered = dictionaryData.filter(item => {
        // เช็คเผื่อกรณีบางช่องเป็นค่าว่าง (null/undefined)
        const term = (item.term || "").toLowerCase();
        const meaning = (item.meaning || "").toLowerCase();
        const keyword = (item.keyword || "").toLowerCase();
        const tag = (item.tag || "").toLowerCase();

        return term.includes(query) || 
               meaning.includes(query) || 
               keyword.includes(query) || 
               tag.includes(query);
    });
    
    renderResults(filtered);
    trackSearch(query, filtered.length > 0);
}

// 3. แสดงผล (ใช้ชื่อ field ให้ตรงกับใน MongoDB)
function renderResults(data) {
    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบข้อมูล...</div>' : '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="word-header">
                <div class="word">${item.term || "ไม่ระบุคำศัพท์"}</div>
                <div class="meaning">${item.meaning || ""}</div>
            </div>
            <div class="definition">${item.define || "ไม่มีคำอธิบาย"}</div>
            <div class="law-systems">
                <div class="law-box">
                    <span class="law-label">Tag / หมวดหมู่</span>
                    ${item.tag || '-'}
                </div>
                <div class="law-box">
                    <span class="law-label">Note</span>
                    ${item.note || '-'}
                </div>
            </div>
            <div class="refer">อ้างอิง: ${item.refer || 'ไม่ระบุ'}</div>
        `;
        resultsDiv.appendChild(div);
    });
}

// 4. บันทึกสถิติ
async function trackSearch(query, isFound) {
    if (localStorage.getItem('cookie_consent') !== 'accepted') return;
    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: query, found: isFound })
        });
    } catch (e) {}
}

// เริ่มโหลดข้อมูลทันทีที่ไฟล์นี้ถูกเรียก
loadData();

// مدیریت تب‌ها
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// جستجوی بیمار
document.getElementById('searchBtn').addEventListener('click', () => {
    const patientCode = document.getElementById('patientCode').value.trim();
    
    if (patientCode.length !== 10 || !/^\d+$/.test(patientCode)) {
        alert('لطفاً کد 10 رقمی معتبر وارد کنید');
        return;
    }

    document.getElementById('results').style.display = 'block';
    loadPatientData(patientCode);
});

// بارگذاری اطلاعات بیمار
function loadPatientData(patientId) {
    const allData = JSON.parse(localStorage.getItem('patients') || '{}');
    const patientData = allData[patientId];

    if (patientData && patientData.drug) {
        document.getElementById('drugNameText').value = patientData.drug.drugName;
        document.getElementById('usageText').value = patientData.drug.usage;
        document.getElementById('doctorName').value = patientData.drug.doctor;
        // فایل بارگذاری‌شده را نمی‌توان دوباره نشان داد
        console.log('فایل قبلی دارو:', patientData.drug.fileName || 'ندارد');
    } else {
        // پاک‌سازی فیلدها اگر اطلاعاتی نبود
        document.getElementById('drugNameText').value = '';
        document.getElementById('usageText').value = '';
        document.getElementById('doctorName').value = '';
        document.getElementById('drugFile').value = '';
    }
}

// بررسی حجم فایل
function validateFile(file) {
    if (file.size > 3 * 1024 * 1024) {
        alert('حجم فایل باید کمتر از 3 مگابایت باشد');
        return false;
    }
    return true;
}

// ذخیره اطلاعات دارویی
document.getElementById('saveDrug').addEventListener('click', () => {
    const patientCode = document.getElementById('patientCode').value.trim();
    if (patientCode.length !== 10 || !/^\d+$/.test(patientCode)) {
        alert('ابتدا یک کد ملی معتبر وارد کنید');
        return;
    }

    const drugName = document.getElementById('drugNameText').value.trim();
    const usage = document.getElementById('usageText').value.trim();
    const doctor = document.getElementById('doctorName').value.trim();
    const file = document.getElementById('drugFile').files[0];

    if (file && !validateFile(file)) return;

    let allData = JSON.parse(localStorage.getItem('patients') || '{}');

    // اگر داده قبلاً وجود داشت، نگه‌داری می‌کنیم
    if (!allData[patientCode]) {
        allData[patientCode] = {};
    }

    allData[patientCode].drug = {
        drugName,
        usage,
        doctor,
        fileName: file ? file.name : ''
    };

    localStorage.setItem('patients', JSON.stringify(allData));

    alert('اطلاعات دارویی ذخیره شد');

    // پاک کردن فیلدها
    document.getElementById('drugNameText').value = '';
    document.getElementById('usageText').value = '';
    document.getElementById('doctorName').value = '';
    document.getElementById('drugFile').value = '';
});

// ذخیره اطلاعات تصویربرداری
document.getElementById('saveImaging').addEventListener('click', () => {
    const imagingFile = document.getElementById('imagingFile').files[0];
    if (imagingFile && !validateFile(imagingFile)) return;
    
    alert('اطلاعات تصویربرداری ذخیره شد');
    saveToDesktop('تصویربرداری');
});

// ذخیره اطلاعات آزمایشگاه
document.getElementById('saveLab').addEventListener('click', () => {
    const labFile = document.getElementById('labFile').files[0];
    if (labFile && !validateFile(labFile)) return;
    
    alert('اطلاعات آزمایشگاه ذخیره شد');
    saveToDesktop('آزمایشگاه');
});

// حذف اطلاعات
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (confirm('آیا از حذف این اطلاعات مطمئن هستید؟')) {
            alert('اطلاعات حذف شد');
            // کد حذف از سرور در اینجا قرار می‌گیرد
        }
    });
});

// شبیه‌سازی ذخیره در دسکتاپ
function saveToDesktop(section) {
    console.log(`اطلاعات بخش ${section} ذخیره شد`);
}
const API_URL = "https://YOUR_DOMAIN_HERE/save_patient.php";

// ارسال فرم به سرور
function sendFormData(formData) {
    fetch(API_URL, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => {
        alert("خطا در ذخیره اطلاعات");
        console.error(err);
    });
}

// ذخیره دارو
document.getElementById('saveDrug').addEventListener('click', () => {
    const formData = new FormData();
    formData.append("patientCode", document.getElementById('patientCode').value.trim());
    formData.append("drugName", document.getElementById('drugNameText').value.trim());
    formData.append("usage", document.getElementById('usageText').value.trim());
    formData.append("doctor", document.getElementById('doctorName').value.trim());
    formData.append("drugFile", document.getElementById('drugFile').files[0]);
    sendFormData(formData);
});

// ذخیره تصویربرداری
document.getElementById('saveImaging').addEventListener('click', () => {
    const formData = new FormData();
    formData.append("patientCode", document.getElementById('patientCode').value.trim());
    formData.append("imagingFile", document.getElementById('imagingFile').files[0]);
    sendFormData(formData);
});

// ذخیره آزمایشگاه
document.getElementById('saveLab').addEventListener('click', () => {
    const formData = new FormData();
    formData.append("patientCode", document.getElementById('patientCode').value.trim());
    formData.append("labFile", document.getElementById('labFile').files[0]);
    sendFormData(formData);
});

// بازیابی اطلاعات بیمار
document.getElementById('searchBtn').addEventListener('click', () => {
    const patientCode = document.getElementById('patientCode').value.trim();
    if(patientCode.length !== 10 || !/^\d+$/.test(patientCode)) {
        alert("لطفا کد ملی 10 رقمی معتبر وارد کنید");
        return;
    }

    const formData = new FormData();
    formData.append("patientCode", patientCode);
    formData.append("action", "getPatient");

    fetch(API_URL, { method: "POST", body: formData })
    .then(res => res.json())
    .then(res => {
        if(res.status === "success" && res.data) {
            const data = res.data;
            document.getElementById('drugNameText').value = data.drugName || "";
            document.getElementById('usageText').value = data.usageText || "";
            document.getElementById('doctorName').value = data.doctor || "";

            // فایل‌ها فقط اسمشون رو نمایش میدیم
            document.getElementById('drugFileName').innerText = data.drugFile || "ندارد";
            document.getElementById('imagingFileName').innerText = data.imagingFile || "ندارد";
            document.getElementById('labFileName').innerText = data.labFile || "ندارد";
        } else {
            alert("اطلاعاتی برای این بیمار پیدا نشد");
        }
    })
    .catch(err => console.error(err));
});

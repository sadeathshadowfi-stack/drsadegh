<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "db_user";      // نام کاربری دیتابیس
$password = "db_pass";      // پسورد دیتابیس
$dbname   = "db_name";      // نام دیتابیس

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "خطا در اتصال به دیتابیس"]));
}

$patientCode = $_POST['patientCode'] ?? "";

// متغیرهای دارو
$drugName = $_POST['drugName'] ?? "";
$usage    = $_POST['usage'] ?? "";
$doctor   = $_POST['doctor'] ?? "";

// ذخیره فایل‌ها
function saveFile($inputName, $folder = "uploads/") {
    if (!isset($_FILES[$inputName]) || $_FILES[$inputName]['error'] != 0) return "";
    if (!is_dir($folder)) mkdir($folder, 0777, true);
    $fileName = time() . "_" . basename($_FILES[$inputName]['name']);
    move_uploaded_file($_FILES[$inputName]['tmp_name'], $folder . $fileName);
    return $fileName;
}

$drugFile    = saveFile("drugFile");
$imagingFile = saveFile("imagingFile");
$labFile     = saveFile("labFile");

// بررسی رکورد قبلی
$sqlCheck = "SELECT id FROM patients WHERE patientCode=?";
$stmt = $conn->prepare($sqlCheck);
$stmt->bind_param("s", $patientCode);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // آپدیت رکورد
    $sql = "UPDATE patients 
            SET drugName=?, usageText=?, doctor=?, 
                drugFile=IF(?<>'', ?, drugFile),
                imagingFile=IF(?<>'', ?, imagingFile),
                labFile=IF(?<>'', ?, labFile)
            WHERE patientCode=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssss", 
        $drugName, $usage, $doctor,
        $drugFile, $drugFile,
        $imagingFile, $imagingFile,
        $labFile, $labFile,
        $patientCode
    );
} else {
    // درج رکورد جدید
    $sql = "INSERT INTO patients 
            (patientCode, drugName, usageText, doctor, drugFile, imagingFile, labFile) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssss", 
        $patientCode, $drugName, $usage, $doctor, $drugFile, $imagingFile, $labFile
    );
}

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "اطلاعات ذخیره شد"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$stmt->close();

// بازیابی اطلاعات بیمار
if(isset($_POST['action']) && $_POST['action'] == 'getPatient') {
    $stmt = $conn->prepare("SELECT * FROM patients WHERE patientCode=?");
    $stmt->bind_param("s", $patientCode);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    echo json_encode(["status" => "success", "data" => $data]);
}

$conn->close();
?>

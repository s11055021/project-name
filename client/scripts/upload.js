async function uploadTeacherInfo() {
    const profileImage = document.getElementById('profileImage').files[0];
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const bio = document.getElementById('bio').value;

    const dayMap = {
        'Monday': '週一',
        'Tuesday': '週二',
        'Wednesday': '週三',
        'Thursday': '週四',
        'Friday': '週五',
        'Saturday': '週六',
        'Sunday': '週日'
    };

    const timeSlotMap = {
        'Morning': '上午',
        'Afternoon': '下午',
        'Evening': '傍晚'
    };

    const availableDates = Array.from(document.querySelectorAll('input[name="availableDates"]:checked')).reduce((acc, input) => {
        const [day, time] = input.value.split(' ');
        const chineseDay = dayMap[day];
        const chineseTime = timeSlotMap[time];
        if (!acc[chineseDay]) {
            acc[chineseDay] = [chineseTime];
        } else {
            acc[chineseDay].push(chineseTime);
        }
        return acc;
    }, {});

    if (profileImage) {
        showLoading(true);

        try {
            const storageRef = firebase.storage().ref();
            const profileImageRef = storageRef.child(`images/${profileImage.name}`);
            await profileImageRef.put(profileImage);
            const imageUrl = await profileImageRef.getDownloadURL();

            const docRef = await db.collection('teachers').add({
                name: name,
                email: email,
                bio: bio,
                availableDates: availableDates,
                profileImageUrl: imageUrl
            });

            const teacherPageContent = generateTeacherPageContent(name, bio, availableDates, imageUrl, email);
            await uploadToGitHub(`teacher_${docRef.id}.html`, teacherPageContent);
        } catch (error) {
            console.error("Error uploading teacher info:", error);
            alert('上傳失敗，請重試。');
        } finally {
            showLoading(false);
        }
    } else {
        alert('請上傳圖片');
    }
}

function generateTeacherPageContent(name, bio, availableDates, imageUrl, email) {
    function isAvailable(day, timeSlot) {
        return availableDates[day] && availableDates[day].includes(timeSlot);
    }

    function generateCells(timeSlot) {
        const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
        return days.map(day => {
            const available = isAvailable(day, timeSlot) ? 'available' : '';
            return `<div class="cell ${available}"></div>`;
        }).join('');
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>台語學習系統</title>
    <style>
        section {
            display: flex;
            flex-wrap: wrap; 
            justify-content: space-around;
            align-items: flex-start; 
            padding: 20px;
        }
        .availability-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr); /* 1 for time slots and 7 for days */
            gap: 5px;
        }
        .time-slot, .day {
            background-color: #f0f0f0;
            text-align: center;
            padding: 10px;
        }
        .cell {
            width: 100%;
            height: 80px;
            background-color: #e0e0e0;
        }
        .cell.available {
            background-color: #40c4ff;
        }
    </style>
    <link rel="stylesheet" href="css/chat.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/mobile.css">
</head>
<body>
    <nav>
        <a href="index.html"><img src="logo.png" alt="logo"></a>
        <ul>
            <li><a href="teacher.html" target="_self">我要當老師</a></li>
            <li><a href="常見問答.html" target="_self">常見問答</a></li>
            <li><a href="說說看.html" target="_self">換我說說看</a></li>
            <li id="user"><a>用戶相關</a>
                <ul>
                    <li class="logout"><a href="#" id="loginButton">登入</a></li>
                    <li class="logout"><a href="#" id="signupButton">註冊</a></li>
                    <li class="login"><a href="學習紀錄.html" id="learningrecord">學習紀錄</a></li>
                    <li class="login"><a href="#" id="logoutButton">登出</a></li>                  
                </ul>
            </li>
        </ul>
    </nav>

    <section>
        <div class="image-section" style="flex: 1; padding: 20px;">
            <img src="${imageUrl}" alt="Image Description" style="max-width: 100%; height: auto;">
        </div>
        <div class="description-section" style="flex: 2; padding: 20px;">
            <h2>${name}</h2>
            <h2><strong>聯絡信箱:</strong> ${email}</h2>
            <p><strong>關於我:</strong> ${bio}</p>
            <p><strong>方便上課的時間:</strong></p>
            <div class="availability-grid">
                <div class="time-slot"></div>
                <div class="day">週日</div>
                <div class="day">週一</div>
                <div class="day">週二</div>
                <div class="day">週三</div>
                <div class="day">週四</div>
                <div class="day">週五</div>
                <div class="day">週六</div>
                
                <div class="time-slot">上午<br>06:00-12:00</div>
                ${generateCells('上午')}
                
                <div class="time-slot">下午<br>12:00-18:00</div>
                ${generateCells('下午')}
                
                <div class="time-slot">傍晚<br>18:00-24:00</div>
                ${generateCells('傍晚')}
                
                <div class="time-slot">深夜<br>00:00-06:00</div>
                ${generateCells('深夜')}
            </div>
        </div>
    </section>

    <div class="container" id="chatContainer">
        <div class="sidebar">
            <div class="contact" onclick="selectContact('Contact 1')">
                <img src="https://via.placeholder.com/50" alt="Contact 1">
                <div>Contact 1</div>
            </div>
        <!-- More contacts can be added here -->
        </div>
        <div class="chat-box">
            <div class="chat-header">
                <span id="chatHeader">Chat</span>
                <button onclick="toggleChat()" style="background:none;border:none;font-size:20px;cursor:pointer;">&times;</button>
            </div>
            <div class="chat-content" id="chatContent">
                <!-- Messages will appear here -->
            </div>
            <div class="chat-input">
                <input type="text" id="chatInput" placeholder="Type a message...">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>

    <button class="toggle-button" id="toggleButton" onclick="toggleChat()">Chat</button>

    <div id="modal-login" class="modal">
        <form id="login">
            <h2>登入</h2>
            <div>
                <label for="account">用戶名：</label>
                <input type="text" id="loginaccount" placeholder="Email" required>
            </div>
            <div>
                <label for="password">密碼：</label>
                <input type="password" id="loginpassword" placeholder="Password" required>
            </div>
            <button type="submit">登入</button>
        </form>
    </div>

    <div id="modal-signup" class="modal">
        <form id="signup">
            <h2>註冊</h2>
            <div>
                <label for="account">用戶名：</label>
                <input type="text" id="account" placeholder="Email" required>
            </div>
            <div>
                <label for="password">密碼：</label>
                <input type="password" id="password" placeholder="Password" required>
            </div>
            <button type="submit">註冊</button>
        </form>
    </div>

    <script src="https://www.gstatic.com/firebasejs/8.6.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.0/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.0/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.6.0/firebase-storage.js"></script>
    <script src="scripts/firebase.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
    <script src="scripts/auth.js"></script>
    <script src="scripts/logbox.js"></script>
    <script src="scripts/chat.js"></script>

    <script src="scripts/upload.js"></script> 

    <footer>
        &copy; 2024 台語學習. All rights reserved.
    </footer>
</body>
</html>
`;
}

// Example uploadToGitHub function
async function uploadToGitHub(filename, content) {
    showLoading(true);
    try {
        const response = await fetch('https://project-name-kixz.onrender.com/api/create-html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename, content }),
        });

        if (response.ok) {
            alert('HTML file created successfully on GitHub!');
        } else {
            alert('Failed to create HTML file on GitHub.');
        }
    } catch (error) {
        console.error("Error uploading to GitHub:", error);
        alert('Failed to create HTML file on GitHub.');
    } finally {
        showLoading(false);
    }
}

function showLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    if (isLoading) {
        loadingElement.style.display = 'flex';
    } else {
        loadingElement.style.display = 'none';
    }
}

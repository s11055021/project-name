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
        'Morning': '早上',
        'Afternoon': '下午',
        'Evening': '晚上'
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

            // Reset the form after successful submission
            document.getElementById('teacherForm').reset();
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
        const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
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
        body {
            font-family: Arial, sans-serif;
        }
        section {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            align-items: flex-start;
            padding: 20px;
        }
        .image-section, .description-section {
            box-sizing: border-box;
            padding: 20px;
        }
        .image-section {
            flex: 1;
            max-width: 50%;
        }
        .image-section img {
            max-width: 100%;
            height: auto;
            display: block;
        }
        .description-section {
            flex: 2;
            display: flex;
            flex-direction: column;
        }
        .availability-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr); /* 1 for time slots and 7 for days */
            gap: 5px;
            margin-bottom: 20px;
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
        .rating-section {
            margin-top: 20px;
        }
        .star-rating {
            display: flex;
            flex-direction: row-reverse;
            justify-content: center;
            padding: 10px 0;
        }
        .star-rating input[type="radio"] {
            display: none;
        }
        .star-rating label {
            font-size: 30px;
            color: #ddd;
            cursor: pointer;
            transition: color 0.2s;
        }
        .star-rating input[type="radio"]:checked ~ label,
        .star-rating label:hover,
        .star-rating label:hover ~ label {
            color: #f5c518;
        }
        textarea {
            width: 95%;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #ccc;
            resize: none;
            height: 100px; /* 固定 textarea 大小 */
        }
        #feedbackbutton {
            background-color: #FFA500;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        #feedbackbutton:hover {
            background-color: #cc8c1d;
        }
        #feedback-list {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        #feedback-list p {
            border-bottom: 1px solid #ddd;
            padding: 10px 0;
        }
        @media (max-width: 768px) {
            .image-section, .description-section {
                max-width: 100%;
                flex: 1 1 100%;
                padding: 10px;
            }
        }
    </style>
    <link rel="icon" href="bookicon.jpg">
    <link rel="stylesheet" href="css/chat.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/mobile.css">
</head>
<body>
    <nav>
        <a href="index.html"><img src="logo.png" alt="logo"></a>
        <ul>
            <li><a href="teacher.html" target="_self">我要當老師</a></li>
            <li><a href="說說看.html" target="_self">視訊教學</a></li>
            <li id="user"><a>用戶相關</a>
                <ul>
                    <li class="logout"><a href="#" id="loginButton">登入</a></li>
                    <li class="logout"><a href="#" id="signupButton">註冊</a></li>
                    <li class="login"><a href="#" id="logoutButton">登出</a></li>                  
                </ul>
            </li>
        </ul>
    </nav>

    <!-- Add a hidden input to store the page identifier -->
    <input type="hidden" id="page-identifier" value="${imageUrl}">
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
                <div class="day">週一</div>
                <div class="day">週二</div>
                <div class="day">週三</div>
                <div class="day">週四</div>
                <div class="day">週五</div>
                <div class="day">週六</div>
                <div class="day">週日</div>
                
                <div class="time-slot">早上<br>09:00~12:00</div>
                ${generateCells('早上')}
                
                <div class="time-slot">下午<br>14:00-17:00</div>
                ${generateCells('下午')}
                
                <div class="time-slot">晚上<br>19:00-22:00</div>
                ${generateCells('晚上')}
                
            </div>
            <div class="rating-section">
                <h3>Leave Your Feedback</h3>
                <form id="rating-form">
                    <div class="star-rating">
                        <input type="radio" id="star5" name="rating" value="5"><label for="star5">★</label>
                        <input type="radio" id="star4" name="rating" value="4"><label for="star4">★</label>
                        <input type="radio" id="star3" name="rating" value="3"><label for="star3">★</label>
                        <input type="radio" id="star2" name="rating" value="2"><label for="star2">★</label>
                        <input type="radio" id="star1" name="rating" value="1"><label for="star1">★</label>
                    </div>
                    <textarea id="feedback" placeholder="在這裡寫下你的回饋..." required></textarea>
                    <button id="feedbackbutton" type="submit">傳送</button>
                </form>
                <div id="feedback-list"></div>
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
    <script src="scripts/feedback.js"></script>

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
        const response = await fetch('https://project-name-yrq9.onrender.com/api/create-html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename, content }),
        });

        if (response.ok) {
            alert('上傳成功');
        } else {
            alert('上傳失敗');
        }
    } catch (error) {
        console.error("Error uploading to GitHub:", error);
        alert('上傳失敗');
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

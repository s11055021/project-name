//是否登入UI
const loggedOutLinks = document.querySelectorAll('.logout');
const loggedInLinks = document.querySelectorAll('.login');
const toggleButton = document.getElementById('toggleButton');
const chatContainer = document.getElementById('chatContainer');

const setupUI = (user) => {
    if (user) {
        loggedInLinks.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none');
        toggleButton.style.display = 'block';
        loadContacts();
    } else {
        loggedInLinks.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block');
        toggleButton.style.display = 'none';
        chatContainer.style.display = 'none';
    }
};

//偵測是否登入
auth.onAuthStateChanged(user => {
    var usernameElement = document.getElementById('user').querySelector('a');
    if (user) {
        console.log("user logged in", user);
        usernameElement.textContent = user.email;
        setupUI(user);
    } else {
        console.log("user logged out");
        usernameElement.textContent = "用戶相關";
        setupUI();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const classButtons = document.querySelectorAll('.button'); // 找到所有開始上課按鈕
    classButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            if (auth.currentUser) {
                window.location.href = this.href; // 如果已登入，繼續導航
            } else {
                alert('請先登入，才能執行此操作'); // 顯示登入提示
            }
        });
    });

    const testLink2 = document.querySelector('a[href="說說看.html"]');
    if (testLink2) {
        testLink2.addEventListener('click', function(event) {
            event.preventDefault();
            if (auth.currentUser) {
                window.location.href = this.href; // 如果已登入，繼續導航
            } else {
                alert('請先登入，才能執行此操作'); // 顯示登入提示
            }
        });
    }
});

//註冊
const signupForm = document.querySelector('#signup');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = signupForm['account'].value;
    const password = signupForm['password'].value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            console.log('User created:', cred.user);
            // 保存用户信息到 Firestore
            return db.collection('users').doc(cred.user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            modal_signup.style.display = 'none';  
            signupForm.reset();  
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                alert('該帳號已被使用');
            } else {
                alert('註冊失敗: ' + error.message);
            }
            console.error('Error signing up:', error);
        });
});



// 登出按鈕事件處理
const logout = document.querySelector('#logoutButton');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        window.location.href = 'index.html'; // 登出後導向首頁
    });
});

//登入
const loginForm = document.querySelector('#login');
loginForm.addEventListener('submit',(e) => {
    e.preventDefault();
    const email = loginForm['loginaccount'].value;
    const password = loginForm['loginpassword'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        modal_login.style.display = 'none';
        loginForm.reset();
    })
    .catch((error) => {
        alert('密碼輸入錯誤，請重新輸入。');
    });
});


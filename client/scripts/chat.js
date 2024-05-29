let currentContact = '';
let unsubscribeFromMessages = null; // Store the unsubscribe function

function toggleChat() {
    const chatContainer = document.getElementById('chatContainer');
    const toggleButton = document.getElementById('toggleButton');
    if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
        chatContainer.style.display = 'flex';
        toggleButton.style.display = 'none';
    } else {
        chatContainer.style.display = 'none';
        toggleButton.style.display = 'block';
    }
}

function loadContacts() {
    const user = firebase.auth().currentUser;
    if (user) {
        const contactsRef = firebase.firestore().collection('users');
        contactsRef.get().then(snapshot => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.innerHTML = ''; // Clear the existing contacts
            snapshot.forEach(doc => {
                const contact = doc.data();
                if (contact.email !== user.email) { // Exclude the current user from the contact list
                    const contactElement = document.createElement('div');
                    contactElement.classList.add('contact');
                    contactElement.onclick = () => selectContact(contact.email);
                    contactElement.innerHTML = `<div>${contact.email}</div>`;
                    sidebar.appendChild(contactElement);
                }
            });
        }).catch(error => {
            console.error("Error loading contacts: ", error);
        });
    }
}

function selectContact(contactEmail) {
    if (unsubscribeFromMessages) {
        unsubscribeFromMessages(); // Unsubscribe from previous snapshot listener
    }

    currentContact = contactEmail;
    document.getElementById('chatHeader').textContent = 'Chat with ' + contactEmail;
    document.getElementById('chatContent').innerHTML = ''; // Clear the existing messages
    loadMessages(contactEmail);
}

function sendMessage() {
    if (!currentContact) {
        alert('請選擇一個聯絡人進行聊天。');
        return;
    }

    const user = firebase.auth().currentUser;
    if (user) {
        const chatContent = document.getElementById('chatContent');
        const chatInput = document.getElementById('chatInput');
        const messageText = chatInput.value.trim();

        if (messageText !== '') {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'sent');
            const bubbleElement = document.createElement('div');
            bubbleElement.classList.add('bubble');
            bubbleElement.textContent = messageText;
            messageElement.appendChild(bubbleElement);

            // 隱藏元素後附加
            messageElement.style.display = 'none';
            chatContent.appendChild(messageElement);
            chatInput.value = '';

            // 顯示元素後附加
            messageElement.style.display = '';

            // 滾動到底部
            chatContent.scrollTop = chatContent.scrollHeight;

            firebase.firestore().collection('messages').add({
                from: user.email,
                to: currentContact,
                message: messageText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}

function loadMessages(contactEmail) {
    const user = firebase.auth().currentUser;
    if (user) {
        const chatContent = document.getElementById('chatContent');
        chatContent.innerHTML = '';

        // 查詢從用戶到聯絡人的消息
        const query1 = firebase.firestore().collection('messages')
            .where('from', '==', user.email)
            .where('to', '==', contactEmail)
            .orderBy('timestamp');

        // 查詢從聯絡人到用戶的消息
        const query2 = firebase.firestore().collection('messages')
            .where('from', '==', contactEmail)
            .where('to', '==', user.email)
            .orderBy('timestamp');

        // 使用 Promise.all 確保兩個查詢都執行
        Promise.all([query1.get(), query2.get()])
            .then(([snapshot1, snapshot2]) => {
                const messages = [];

                snapshot1.forEach((doc) => {
                    messages.push(doc.data());
                });

                snapshot2.forEach((doc) => {
                    messages.push(doc.data());
                });

                // 根據時間戳排序消息
                messages.sort((a, b) => a.timestamp - b.timestamp);

                chatContent.innerHTML = ''; // 清空現有消息
                messages.forEach((data) => {
                    const messageElement = document.createElement('div');
                    const bubbleElement = document.createElement('div');
                    bubbleElement.classList.add('bubble');
                    bubbleElement.textContent = data.message;

                    if (data.from === user.email) {
                        messageElement.classList.add('message', 'sent');
                    } else {
                        messageElement.classList.add('message', 'received');
                    }

                    messageElement.appendChild(bubbleElement);

                    // 隱藏元素後附加
                    messageElement.style.display = 'none';
                    chatContent.appendChild(messageElement);
                });

                // 顯示元素後附加
                chatContent.querySelectorAll('.message').forEach(element => {
                    element.style.display = '';
                });

                // 滾動到底部
                chatContent.scrollTop = chatContent.scrollHeight;
            })
            .catch(error => {
                console.error("Error loading messages: ", error);
            });
    }
}


document.getElementById('chatInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

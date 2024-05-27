let currentContact = '';

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
    currentContact = contactEmail;
    document.getElementById('chatHeader').textContent = 'Chat with ' + contactEmail;
    document.getElementById('chatContent').innerHTML = ''; // Clear the existing messages
    loadMessages(contactEmail);
}

function sendMessage() {
    if (!currentContact) {
        alert('Please select a contact to chat with.');
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
            chatContent.appendChild(messageElement);
            chatInput.value = '';
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

        // First query: messages from the user to the contact
        firebase.firestore().collection('messages')
            .where('from', '==', user.email)
            .where('to', '==', contactEmail)
            .orderBy('timestamp')
            .onSnapshot((snapshot) => {
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const messageElement = document.createElement('div');
                    const bubbleElement = document.createElement('div');
                    bubbleElement.classList.add('bubble');
                    bubbleElement.textContent = data.message;

                    messageElement.classList.add('message', 'sent');

                    messageElement.appendChild(bubbleElement);
                    chatContent.appendChild(messageElement);
                });
                chatContent.scrollTop = chatContent.scrollHeight;
            });

        // Second query: messages from the contact to the user
        firebase.firestore().collection('messages')
            .where('from', '==', contactEmail)
            .where('to', '==', user.email)
            .orderBy('timestamp')
            .onSnapshot((snapshot) => {
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const messageElement = document.createElement('div');
                    const bubbleElement = document.createElement('div');
                    bubbleElement.classList.add('bubble');
                    bubbleElement.textContent = data.message;

                    messageElement.classList.add('message', 'received');

                    messageElement.appendChild(bubbleElement);
                    chatContent.appendChild(messageElement);
                });
                chatContent.scrollTop = chatContent.scrollHeight;
            });
    }
}


document.getElementById('chatInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

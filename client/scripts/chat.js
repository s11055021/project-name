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

            // Hide the element before appending
            messageElement.style.display = 'none';
            chatContent.appendChild(messageElement);
            chatInput.value = '';
            chatContent.scrollTop = chatContent.scrollHeight;

            // Show the element after appending
            messageElement.style.display = '';

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
        const query1 = firebase.firestore().collection('messages')
            .where('from', '==', user.email)
            .where('to', '==', contactEmail)
            .orderBy('timestamp');

        // Second query: messages from the contact to the user
        const query2 = firebase.firestore().collection('messages')
            .where('from', '==', contactEmail)
            .where('to', '==', user.email)
            .orderBy('timestamp');

        // Combine the queries and listen to changes
        unsubscribeFromMessages = firebase.firestore().collectionGroup('messages')
            .onSnapshot((snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    messages.push(data);
                });

                // Sort messages by timestamp
                messages.sort((a, b) => a.timestamp - b.timestamp);

                chatContent.innerHTML = ''; // Clear the existing messages
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

                    // Hide the element before appending
                    messageElement.style.display = 'none';
                    chatContent.appendChild(messageElement);
                });

                // Show the elements after appending
                chatContent.querySelectorAll('.message').forEach(element => {
                    element.style.display = '';
                });

                chatContent.scrollTop = chatContent.scrollHeight;
            });

        // Use Promise.all to ensure both queries are executed
        Promise.all([query1.get(), query2.get()])
            .then(([snapshot1, snapshot2]) => {
                const messages = [];

                snapshot1.forEach((doc) => {
                    messages.push(doc.data());
                });

                snapshot2.forEach((doc) => {
                    messages.push(doc.data());
                });

                // Sort messages by timestamp
                messages.sort((a, b) => a.timestamp - b.timestamp);

                chatContent.innerHTML = ''; // Clear the existing messages
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

                    // Hide the element before appending
                    messageElement.style.display = 'none';
                    chatContent.appendChild(messageElement);
                });

                // Show the elements after appending
                chatContent.querySelectorAll('.message').forEach(element => {
                    element.style.display = '';
                });

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

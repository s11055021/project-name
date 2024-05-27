// feedback.js
document.getElementById('rating-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    if (!user) {
        alert('請先登入再提交回饋');
        return;
    }

    const rating = document.querySelector('input[name="rating"]:checked').value;
    const feedback = document.getElementById('feedback').value;

    db.collection('feedback').add({
        user: user.email,
        rating: rating,
        feedback: feedback,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert('Feedback submitted successfully!');
        loadFeedback();
        document.getElementById('rating-form').reset();
    }).catch((error) => {
        console.error('Error submitting feedback: ', error);
    });
});

function loadFeedback() {
    db.collection('feedback').orderBy('timestamp', 'desc').get().then((querySnapshot) => {
        const feedbackList = document.getElementById('feedback-list');
        feedbackList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const feedbackData = doc.data();
            const timestamp = new Date(feedbackData.timestamp.seconds * 1000);
            const formattedTime = `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`;
            feedbackList.innerHTML += `<p><strong>${feedbackData.user}</strong><strong> (${feedbackData.rating}顆星)</strong>: ${feedbackData.feedback} - ${formattedTime}</p>`;
        });
    }).catch((error) => {
        console.error('Error loading feedback: ', error);
    });
}


// Load feedback on page load
window.onload = function () {
    loadFeedback();
};

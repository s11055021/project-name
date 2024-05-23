const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/create-html', async (req, res) => {
    const { filename, content } = req.body;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 's11055021';
    const REPO_NAME = 's11055021.githib.io';
    const FILE_PATH = ``;
    const COMMIT_MESSAGE = 'Create new HTML file';

    try {
        let sha = '';
        try {
            const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });
            sha = response.data.sha;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                sha = undefined;
            } else {
                throw error;
            }
        }

        const response = await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            message: COMMIT_MESSAGE,
            content: Buffer.from(content).toString('base64'),
            sha: sha
        }, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        res.status(200).send('HTML file created successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create HTML file.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

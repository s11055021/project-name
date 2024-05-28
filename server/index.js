const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());

app.post('/api/create-html', async (req, res) => {
    const { filename, content } = req.body;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 's11055021';
    const REPO_NAME = 'project-name';
    const FILE_PATH = `client/${filename}`;
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

// 新增這段代碼
app.post('/convert', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5000/convert', req.body); // 假設Flask伺服器在5000端口運行
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error converting text');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

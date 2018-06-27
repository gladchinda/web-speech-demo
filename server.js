const cors = require('cors');
const path = require('path');
const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('port', PORT);
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/quote', (req, res) => {
  axios.get('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1')
    .then((response) => {
      const [ post ] = response.data;
      const { title, content } = post || {};

      return (title && content)
        ? res.json({ status: 'success', data: { title, content } })
        : res.status(500).json({ status: 'failed', message: 'Could not fetch quote.' });
    })
    .catch(err => res.status(500).json({ status: 'failed', message: 'Could not fetch quote.' }));
});

app.listen(PORT, () => console.log(`> App server is running on port ${PORT}.`));

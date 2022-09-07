const express = require('express');

const { variables } = require('./config');


const v1IndexRouter = require('./v1/routes/indexRouter');

const app = express();

app.use(
    express.urlencoded({
      extended: true,
    })
);

app.use(express.json());

// API entry point
app.use('/api/v1', v1IndexRouter);

app.get('/*', (req, res) => {
    res.status(500).send('Cette page est inexistante!');
});

app.listen(variables.PORT, () => {
    console.log(`API is listening on http://localhost:${variables.PORT}`);
});
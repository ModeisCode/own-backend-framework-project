const EntityServer = require('./app');
const es = new EntityServer();

es.get('/about', (req, res) => {
    console.log(req.body);
    app.handleStaticFiles('/about.html', res);
});

es.post('/contact', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Contact data received', data: req.body }));
});

es.get('*', (req, res) => {
    const filePath = req.url;
    app.handleStaticFiles(filePath, res);
});

es.listen(3000, () => {
    console.log('Server is running on port 3000');
});
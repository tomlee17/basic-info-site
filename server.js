const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
    const baseURL = 'http://' + req.headers.host;
    const q = new URL(req.url, baseURL);
    //  console.log(q);

    const fileName = (q.pathname === '/') ? 'time.html' : `.${q.pathname}.html`;
    // console.log(fileName);

    fs.readFile(fileName, (err, data) => {
        try {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        } catch (err) {
            fs.readFile('404.html', (err, data404) => {
                if (err) throw err;
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.write(data404);
                return res.end();
            })
        }
    })
}).listen(8080, () => console.log('Listening on port 8080...'));
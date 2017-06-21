Bajoo Web interface
===================

Web interface for the Bajoo cloud service.

This *single-page application* allows you to use your Bajoo account to see your files, download them and upload new files.


It's a 100% client-side interface, using the Bajoo API. There is no server part (other than the Bajoo API).

## Platform support

The Bajoo web interface relies on [openpgpjs](https://openpgpjs.org/) for the cryptographic part.
It should support Firefox 38+, Chrome 38+, IE 10+ and Safari 10+.


## Build

The web interface uses `npm` for managing dependencies, and `webpack` for the build.

```sh
cd web-interface
npm install  # install dependencies

npm run prod  # build the production version
```

Once `webpack` is done, the new `dist/` folder contains everything needed.
`dist/index.html` can be opened in any recent web browser.
The folder can be safely copied and renamed, used in local or through a web server.

## dev

The web app can be built in dev mode:
```sh
npm start  # build & listen to file changes
```

Also, it has unit tests, an internal documentation API as well as a few lint rules used to maintain code quality.
```sh
npm test  # run the tests
npm run jshint  # check jshint rules
npm run doc  # build the doc. The index can be found in './doc/index.html'
```

## License

The Bajoo web interface is available under the MIT license:


>Copyright 2017 Bajoo
>
>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.




## Contact

If you have bug reports, comments, questions, or just want to share a word with us,
feel free to contact us at support-fr@bajoo.fr (in french) or support-en@bajoo.fr (english).
We'll be happy to discuss this with you! We don't bite and neither Bajoo does.

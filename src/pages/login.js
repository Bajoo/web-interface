
import m from 'mithril';
import {crypto} from 'openpgp';


function hash_password(password) {
    var u8a_password = crypto.hash.sha256(password);

    // Convert Uint8Array to hex string.
    return u8a_password.reduce((acc, i) => acc + ('0' + i.toString(16)).slice(-2), '');
}


export default {
    oninit() {
        this.is_loading = false;
        this.error_message = null;
        this.username = null;
        this.password = null;
    },

    view(vscope) {
        return m('.container', 
                 m('.panel.panel-default', 
                     m('.panel-body', [
                         m('h2', 'Connexion'),
                            m('form', { onsubmit: ()=> this.submit()}, [
                                this.error_message ? m('.alert .alert-danger', this.error_message) : '',
                                m('fieldset', { disabled: this.is_loading}, [
                                    m('.form-group', [
                                        m('label', 'Username'),
                                        m('.input-group', [
                                            m('span.input-group-addon', m('span.glyphicon.glyphicon-user[aria-hidden="true"]')),
                                            m('input[type="email"].form-control', {
                                                oninput: event => this.username = event.target.value,
                                                value: this.username
                                            })
                                        ])
                                    ]),
                                    m('.form-group', [
                                        m('label', 'Password'),
                                        m('.input-group', [
                                            m('span.input-group-addon', m('span.glyphicon.glyphicon-lock[aria-hidden="true"]')),
                                            m('input[type="password"][required].form-control',{
                                                oninput: event => this.password = event.target.value,
                                                value: this.password
                                            })
                                        ])
                                    ]),
                                    m('button[type="submit"].btn.btn-default', 'Submit')
                                ])
                            ])
                     ]

                      )
                  )
        );
    },
    
    submit() {
        var base_url = 'https://api.dev.bajoo.fr';
        this.is_loading = true;
        
        console.log('submit');
        
        var request_data = {
            username: this.username,
            password: this.password,
            grant_type: 'password'
        };

        request_data.password = hash_password(this.password);
        console.log(`"${request_data.password}"`);
        
        var client_id = 'e2676e5d1fff42f7b32308e5eca3c36a';
        var client_password = '<client-secret>';

        //TODO: it may be not needed.
        function serialize_form_urlencoded(data) {
            var urlEncodedDataPairs = [];

            // Turn the data object into an array of URL-encoded key/value pairs.
            for (var name in request_data) {
                urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
            }

            // Combine the pairs into a single string and replace all %-encoded spaces to 
            // the '+' character; matches the behaviour of browser form submissions.
            return urlEncodedDataPairs.join('&').replace(/%20/g, '+');
        }

        var x= m.request({
            method: 'POST',
            url: base_url + '/token',
            //user: 'e2676e5d1fff42f7b32308e5eca3c36a', // client ID
            //password: 'client-secret',
            data: request_data,
            background: true,
            headers: {
                Authorization: `Basic ${btoa([client_id, client_password].join(':'))}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            serialize: serialize_form_urlencoded
        })
        .then(value => {
            this.is_loading = false;
            m.route('/');
        }).catch(err => {
            
            this.is_loading = false;
            if (err.error === 'invalid_grant' && err.error_description == "Invalid credentials given.")
                this.error_message = 'Inavlid username and/or password';
            else if (err.error_description)
                this.error_message = err.error_description;
            else
                this.error_message = err.message || 'Unknown error';
            m.redraw();
        });
    }
};

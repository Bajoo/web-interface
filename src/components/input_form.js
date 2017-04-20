
import m from 'mithril';


export default {
    /**
     * @param id {string}
     * @param label {string}
     * @param icon {string} glyphicon reference name
     * @param value {Function} instance of `prop()`, getter and setter of the input value
     * @param type {string} type of the input tag
     * @param [error] {string}
     */
    view({attrs: {id, label, icon, value, type, error}}) {
        return m('.form-group', {class: error ? 'has-error' : ''}, [
            m('label', {for: id}, label),
            m('.input-group', [
                m('span.input-group-addon', m('span.glyphicon[aria-hidden=true]', {class: `glyphicon-${icon}`})),
                m('input[required].form-control', {
                    type,
                    id,
                    oninput: event => value(event.target.value),
                    value: value()
                })
            ]),
            error ? m('span.help-block', error) : ''
        ]);
    }
};


import m from 'mithril';


/**
 * Attributes:
 *  id {string}
 *  label {string}
 *  icon {string} glyphicon reference name
 *  value {Function} instance of `prop()`, getter and setter of the input value
 *  type {string} type of the input tag
 */
export default {
    view({attrs}) {
        return m('.form-group', [
            m('label', {for: attrs.id}, attrs.label),
            m('.input-group', [
                m('span.input-group-addon', m('span.glyphicon[aria-hidden=true]', {class: `glyphicon-${attrs.icon}`})),
                m('input[required].form-control', {
                    type: attrs.type,
                    id: attrs.id,
                    oninput: event => attrs.value(event.target.value),
                    value: attrs.value()
                })
            ])
        ]);
    }
};

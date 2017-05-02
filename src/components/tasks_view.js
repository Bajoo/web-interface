
import m from 'mithril';
import StatusAlert from './status_alert';
import PassphraseInputModal from './passphrase_input_modal';


/**
 * A representation of tasks and theirs progressions.
 *
 * It also display the passphrase input modal when needed.
 */
export default class TaskView {

    /**
     * @param task_manager {TaskManager}
     */
    static make(task_manager) {
        return m(TaskView, {task_manager});
    }

    view({attrs: {task_manager}}) {
        return [
            task_manager.passphrase_input.enabled ? PassphraseInputModal.make(task_manager.passphrase_input) : '',
            task_manager.tasks.length > 0 ? ['Ongoing Tasks: ', task_manager.tasks.length] : '',
            StatusAlert.make(task_manager.app_status)
        ];
    }
}

import { Notify, useQuasar } from 'quasar';

const notification = (type, message, options = {}) => {
  if (!message) {
    return;
  }

  return Notify.create({
    type,
    message,
    ...options,
  });
}; // notification()

const notifyNegative = (message, opts = {}) => {
  const options = {
    timeout: 0,
    actions: [
      {
        icon: 'close',
        color: 'white',
      },
    ],
    ...opts,
  };

  notification('negative', message, options);
}; // notifyNegative()

const notifyWarning = (message, opts = {}) => {
  const options = {
    timeout: 0,
    actions: [
      {
        icon: 'close',
        color: 'black',
      },
    ],
    ...opts,
  };

  notification('warning', message, options);
}; // notifyWarning()

const notifySuccess = (message, opts = {}) => {
  const options = {
    progress: true,
    ...opts,
  };

  notification('positive', message, options);
}; // notifySuccess()

const useDialog = () => {
  const $q = useQuasar();

  const confirmDialog = (title, message, onOk, opts = {}, onCancel = () => {}) => {
    // confirm dialog doesn't make sense without onOk() function
    if (!onOk) {
      return;
    }

    return $q
      .dialog({
        title,
        message,
        cancel: true,
        persistent: true,
        ...opts,
      })
      .onOk(onOk)
      .onCancel(onCancel);
  }; // confirmDialog()

  const alertDialog = (title, message, opts) => {
    return $q
      .dialog({
        title,
        message,
        ...opts,
      })
      .onOk(() => {});
  }; // alertDialog()

  /**
   * Opens dialog window with component settled inside
   *
   * @param {Object} component
   * @param {Object?} props 
   * @param {Function?} onOk 
   * @param {Function?} onCancel 
   * @param {Function?} onDismiss
   * @param {Object?} opts
   *
   */
  const openComponentDialog = (component, props, onOk, onCancel, onDismiss, opts = {}) => {
    const dialog = $q
      .dialog({
        component,
        ...opts,
        componentProps: props,
      });

    if (onOk) {
      dialog.onOk(onOk);
    }

    if (onCancel) {
      dialog.onCancel(onCancel);
    }

    if (onDismiss) {
      dialog.onDismiss(onDismiss);
    }

    return dialog;
  }; // openComponentDialog()

  return { confirmDialog, alertDialog, openComponentDialog };
};

export {
  notifyNegative,
  notifyWarning,
  notifySuccess,
  useDialog,
};

import { HEFilePickerShow } from 'components/HEFilePicker';
import RichTextEditorShow from 'components/HERichTextEditor';

let bindOpen = () => {
  return function (type, options, success, fail) {
    switch (type) {
      case 'FilePicker':
        HEFilePickerShow(success, fail, options);
        break;
      case 'RichTextEditor':
        RichTextEditorShow(options, success, fail);
        break;
      default:
        break;
    }
  };
};

export { bindOpen };

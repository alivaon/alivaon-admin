'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FileRepository,
  FontBackgroundColor,
  FontColor,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  SourceEditing,
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  Underline,
  Undo,
  type EditorConfig,
  type FileLoader,
  type UploadAdapter,
} from 'ckeditor5';
import frenchUi from 'ckeditor5/translations/fr.js';
import 'ckeditor5/ckeditor5.css';
import { uploadImage } from '@/lib/content/api';

/** Images du corps de l'article : POST /api/admin/uploads/content. */
class ContentUploadAdapter implements UploadAdapter {
  constructor(private readonly loader: FileLoader) {}

  async upload() {
    const file = await this.loader.file;
    if (!file) {
      throw new Error('Aucun fichier.');
    }
    const { url } = await uploadImage('content', file);
    return { default: url };
  }

  abort() {}
}

/*
 * Même configuration que l'éditeur d'EasyAdmin (assets/js/ckeditor_init.js
 * d'alivaon-symfony) : mêmes plugins, donc même HTML produit — le corps des
 * articles est rendu tel quel par le site (parité SEO).
 */
const CONFIG: EditorConfig = {
  licenseKey: 'GPL',
  plugins: [
    Essentials,
    Paragraph,
    Undo,
    Autoformat,
    Bold,
    Italic,
    Underline,
    Heading,
    Link,
    BlockQuote,
    List,
    Indent,
    IndentBlock,
    Alignment,
    FontColor,
    FontBackgroundColor,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageUpload,
    ImageResize,
    FileRepository,
    Table,
    TableToolbar,
    TableCellProperties,
    TableProperties,
    MediaEmbed,
    HorizontalLine,
    SourceEditing,
  ],
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'alignment',
      '|',
      'link',
      'blockQuote',
      '|',
      'bulletedList',
      'numberedList',
      'outdent',
      'indent',
      '|',
      'uploadImage',
      'insertTable',
      'mediaEmbed',
      'horizontalLine',
      '|',
      'sourceEditing',
      '|',
      'undo',
      'redo',
    ],
    shouldNotGroupWhenFull: true,
  },
  alignment: { options: ['left', 'center', 'right', 'justify'] },
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraphe', class: 'ck-heading_paragraph' },
      { model: 'heading2', view: 'h2', title: 'Titre 2 (H2)', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Titre 3 (H3)', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'Titre 4 (H4)', class: 'ck-heading_heading4' },
    ],
  },
  image: {
    toolbar: ['imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative', 'toggleImageCaption', 'resizeImage'],
  },
  table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'] },
  mediaEmbed: { previewsInData: true },
  // Interface de l'éditeur en français (sans effet sur le HTML produit).
  language: 'fr',
  translations: [frenchUi],
};

export default function RichTextEditor({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rich-text" id={id}>
      <CKEditor
        editor={ClassicEditor}
        config={{ ...CONFIG, initialData: value }}
        onReady={(editor) => {
          editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new ContentUploadAdapter(loader);
        }}
        onChange={(_, editor) => onChange(editor.getData())}
      />
    </div>
  );
}

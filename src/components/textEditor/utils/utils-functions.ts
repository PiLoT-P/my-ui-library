import { urlForFileServer } from '@lib/requests/disc.requests';
import DOMPurify from 'dompurify';
import { QuoteAuthor } from './TextEditor.interface';
import  s from '../TextEditor.module.scss';


DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (!(node instanceof Element)) return;

  if (node.tagName === "A") {
    const href = node.getAttribute("href") || "";

    if (!href.startsWith("http") && !href.startsWith("mailto")) {
      node.removeAttribute("href");
    }

    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export const cleanHTML = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b',
      'strong',
      'i',
      'em',
      'u',
      'a',
      'br',
      'blockquote',
      'code'
    ],

    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'data-user-id'
    ],

    ALLOW_DATA_ATTR: true,

    FORBID_TAGS: [
      'style',
      'script',
      'meta',
      'iframe'
    ],

    FORBID_ATTR: [
      'style',
      'onerror',
      'onclick'
    ]
});

export const createUserLink = (user: { id: number, lastName: string, firstName: string }) => (`<a href="" class="user-marker" type="button" data-user-id="${user.id}">${user.lastName} ${user.firstName}</a> `)

export const moveCursorToEnd = (editor: HTMLElement) => {
  const range = document.createRange();
  const selection = window.getSelection();

  range.selectNodeContents(editor);
  range.collapse(false);

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  editor.focus();
}

export const createScreenshotHTML = (data: {id: string, name: string}, useBr?: boolean) => (`<img src="${urlForFileServer(data.id)}" alt="${decodeURIComponent(data.name)}" class="screenshot" loading="lazy" />${useBr ? '<br/>' : ''}`)

export const createQuoteHTML = (author: QuoteAuthor, content: string) => (`<blockquote class="quote-block">${createUserLink(author)}<div class="quote-content">${cleanHTML(content)}</div></blockquote><br>`);

// Пустий стейт (placeholder)
export const updateEmptyState = (editor: HTMLElement) => {

  // const text = editorRef.current.textContent?.trim();
  const text = editor.innerText.trim();
  const hasContentElement = !!editor.querySelector('img, video, iframe');

  const isEmpty = !text && !hasContentElement;

  editor.classList.toggle(s.empty, isEmpty);
};

// Вставка HTML у позицію курсора
export const insertHtmlAtCursor = (editor: HTMLElement, html: string) => {
  const selection = window.getSelection();

  if (
    selection &&
    selection.rangeCount > 0 &&
    editor.contains(selection.anchorNode)
  ) {
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const fragment = range.createContextualFragment(html);
    range.insertNode(fragment);
  } else {
    editor.insertAdjacentHTML("beforeend", html);
  }

  editor.focus();

  // важливо
  editor.dispatchEvent(new Event("input", { bubbles: true }));

  // Виклик оновлення після вставки
  setTimeout(() => {
    updateEmptyState(editor);
  },0);
};

export const createCodeBlock = (): string => ('<pre class="code-container"><code class="code-block">|</code></pre><br />')

export const createEmogiIcon = (emojiUrl: string, emojiName: string) => (`<img class="emoji_icon" src=${emojiUrl} alt=${emojiName} />`)

export const createEditorLink = (link: string, text: string) => (`<a href="${link}" className="editor-text-link" target="_blank" rel="noopener noreferrer">${text}</a>`)
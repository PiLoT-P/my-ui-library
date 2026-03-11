import { createScreenshotHTML } from "../../utils/utils-functions";


const replaceScreenshotToMarkdown = (html: string) => {
  const pattern = /<img\s+([^>]*class="screenshot"[^>]*)\/?>/g;

  const replaceMatch = (match: string) => {
    const srcMatch = match.match(/src="([^"]+)"/);
    const altMatch = match.match(/alt="([^"]+)"/);

    if (!srcMatch || !altMatch) return match

    const src = srcMatch[1];
    const alt = altMatch[1];

    const urlParams = new URLSearchParams(src.split('?')[1]);
    const fileGuid = urlParams.get('id') || '';

    return `![${alt}](${fileGuid})`;
  };

  return html.replace(pattern, replaceMatch);
}

const linkifyHtml = (html: string) => {
  const container = document.createElement("div");
  container.innerHTML = html;

  const urlRegex = /\b(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

  let node: Node | null;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (parent?.closest("a")) continue;

    const text = node.textContent || "";
    const matches = [...text.matchAll(urlRegex)];

    if (!matches.length) continue;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    matches.forEach((match) => {
      const [url] = match;
      const index = match.index || 0;

      // Додати текст перед URL
      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }

      // Створити посилання
      const a = document.createElement("a");
      a.href = url.startsWith("http") ? url : `https://${url}`;
      a.textContent = url;
      a.target = "_blank";

      fragment.appendChild(a);
      lastIndex = index + url.length;
    });

    // Додати залишок тексту
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    parent?.replaceChild(fragment, node);
  }

  return container.innerHTML;
}


const convertImgMarkdownToHTML = (content: string) => {
  const pattern = /!\[([^\]]*)\]\(([^\)]+)\)/g;

  const replaceMatch = (
    _: string,
    alt: string,
    fileGuid: string
  ) => {
    return createScreenshotHTML({id: fileGuid, name: alt.trim() });
  };

  return content.replace(pattern, replaceMatch);
}

export const parseContentToHTML = (content: string) => {
  let html = content;

  html = convertImgMarkdownToHTML(html);

  return html;
};

export const parseHTMLtoContent = (html: string) => {
  let content = html;
  
  content = linkifyHtml(content);
  content = replaceScreenshotToMarkdown(content);

  return content;
}

/*
  const normalizeLineBreaks = (text: string) => {
    return text
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\n/g, "<br/>")
      .replace(/<br\s*\/?>\s*(<br\s*\/?>\s*)+/gi, "<br/><br/>");
  };

  const sanitizeLineBreaks = (text: string) => {
    // Нормалізує всі варіанти переносу рядків
    let normalized = text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");

    // Розбиваємо на рядки
    const lines = normalized.split("\n");

    const result: string[] = [];
    let emptyCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        // Порожній рядок
        emptyCount++;
        if (emptyCount <= 2) result.push(""); // максимум два порожніх
      } else {
        emptyCount = 0;
        result.push(trimmed);
      }
    }

    // Повертаємо назад у текст з переносами або з <br/> для HTML
    return result.join("\n");
  };

  const normalizeContentForDisplay = (content: string) => {
    // Крок 1: замінюємо різні переносі на один формат
    let normalized = content.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");

    // Крок 2: видаляємо зайві пробіли та порожні рядки
    const lines = normalized.split("\n");

    const result: string[] = [];
    let emptyCount = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        emptyCount++;
        if (emptyCount <= 2) result.push(""); // максимум два порожніх рядки
      } else {
        emptyCount = 0;
        result.push(line); // зберігаємо оригінальні відступи всередині рядка
      }
    }

    // Крок 3: перетворюємо у HTML
    let html = result
      .map((line) => {
        // Зберігаємо картинки, лінки і т.д. як є
        if (line.match(/^<.*>$/)) return line;
        return line.replace(/\n/g, "<br/>");
      })
      .join("<br/>"); // додаємо <br/> між рядками
    
    return html;
  };
*/
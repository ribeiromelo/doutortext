import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { TextStyleKit } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { TableKit } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import DOMPurify from 'dompurify'

const htmlPattern = /<\/?(?:p|div|br|b|strong|i|em|u|s|strike|span|h[1-6]|blockquote|pre|code|ul|ol|li|table|thead|tbody|tr|td|th|font|a|hr|img|sub|sup)(?:\s[^>]*|\s*\/?)>/i
const blocks = 'p,div,h1,h2,h3,h4,h5,h6,ul,ol,li,blockquote,pre,table,tr,hr'
const tags = ['p','div','br','b','strong','em','i','u','s','strike','span','h1','h2','h3','h4','h5','h6','blockquote','pre','code','ul','ol','li','a','hr','table','thead','tbody','tfoot','tr','th','td','img','sub','sup','font','mark']

/** Detect legacy HTML without treating clinical comparisons such as “PA < 90” as markup. */
export function isHTML(value: string): boolean { return htmlPattern.test(value || '') }

/** Used only for display/import. Loading a note never writes this normalized representation back. */
export function prepareHTML(value: string): string {
  const source = String(value || '')
  if (!isHTML(source)) {
    return source.replace(/\r\n?/g, '\n').split('\n').map(line => {
      const p = document.createElement('p'); p.textContent = line
      return line ? p.outerHTML : '<p></p>'
    }).join('')
  }
  const fragment = DOMPurify.sanitize(source, {
    ALLOWED_TAGS: tags,
    ALLOWED_ATTR: ['href','title','target','rel','style','colspan','rowspan','start','src','alt','width','height','color','face','size','data-color'],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  })
  const root = document.createElement('div')
  root.append(fragment)
  for (const old of Array.from(root.querySelectorAll('font'))) {
    const span = document.createElement('span')
    span.style.color = old.getAttribute('color') || ''
    span.style.fontFamily = old.getAttribute('face') || ''
    const size = Number(old.getAttribute('size'))
    if (size >= 1 && size <= 7) span.style.fontSize = [10,13,16,18,24,32,48][size - 1] + 'px'
    span.append(...Array.from(old.childNodes)); old.replaceWith(span)
  }
  for (const element of Array.from(root.querySelectorAll<HTMLElement>('[style]'))) {
    const input = element.style
    const safe = document.createElement('span').style
    for (const name of ['color','background-color','font-weight','font-style','text-decoration','text-align','font-family','font-size','line-height']) {
      const value = input.getPropertyValue(name)
      if (!value || /url|expression|var\(|[{}<>]/i.test(value)) continue
      if (name === 'font-size' && (parseFloat(value) > 72 || parseFloat(value) < 8)) continue
      safe.setProperty(name, value)
    }
    element.removeAttribute('style')
    if (safe.cssText) element.setAttribute('style', safe.cssText)
  }
  for (const link of Array.from(root.querySelectorAll('a'))) {
    const href = link.getAttribute('href') || ''
    if (!/^(https?:|mailto:|\/|#)/i.test(href)) link.removeAttribute('href')
    link.setAttribute('rel', 'noopener noreferrer'); link.setAttribute('target', '_blank')
  }
  for (const image of Array.from(root.querySelectorAll('img'))) {
    const src = image.getAttribute('src') || ''
    if (/^data:/i.test(src) && !/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(src)) image.removeAttribute('src')
  }
  // contenteditable notes used nested DIVs for new paragraphs. Keep their boundaries.
  for (const div of Array.from(root.querySelectorAll('div')).reverse()) {
    if (div.querySelector(blocks)) div.replaceWith(...Array.from(div.childNodes))
    else {
      const p = document.createElement('p')
      if (div.getAttribute('style')) p.setAttribute('style', div.getAttribute('style')!)
      p.append(...Array.from(div.childNodes)); div.replaceWith(p)
    }
  }
  for (const p of Array.from(root.querySelectorAll('p'))) {
    if (!p.textContent?.trim() && Array.from(p.children).every(child => child.tagName === 'BR')) p.replaceChildren()
  }
  return root.innerHTML || '<p></p>'
}

export function text(value: string): string {
  if (!isHTML(value)) return value || ''
  const root = document.createElement('div'); root.innerHTML = prepareHTML(value)
  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
    if (!(node instanceof Element)) return ''
    if (node.tagName === 'BR') return '\n'
    const content = Array.from(node.childNodes).map(walk).join('')
    return content + (node.matches(blocks) ? '\n' : '')
  }
  return Array.from(root.childNodes).map(walk).join('').replace(/\n{3,}/g,'\n\n').trimEnd()
}

export function render(element: HTMLElement, content: string): void {
  const template = document.createElement('template'); template.innerHTML = prepareHTML(content)
  element.replaceChildren(template.content)
  element.classList.add('dt-rich-document')
}

type Options = { element: HTMLElement; toolbar?: HTMLElement; content: string; label?: string; onChange?: (html: string, plain: string) => void }

export function create(options: Options) {
  const editor = new Editor({
    element: options.element,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } } }),
      TextStyleKit,
      TextAlign.configure({ types: ['heading','paragraph'] }),
      TableKit.configure({ table: { resizable: false } }),
      Image.configure({ allowBase64: true }),
      Highlight.configure({ multicolor: true }), Subscript, Superscript,
    ],
    content: prepareHTML(options.content),
    editorProps: {
      attributes: { class: 'dt-rich-document', role: 'textbox', 'aria-multiline': 'true', 'aria-label': options.label || 'Conteúdo da nota' },
      transformPastedHTML: html => prepareHTML(html),
    },
    onUpdate: ({ editor }) => options.onChange?.(editor.getHTML(), editor.getText({ blockSeparator: '\n' })),
  })
  if (options.toolbar) buildToolbar(options.toolbar, editor)
  return {
    getHTML: () => editor.getHTML(),
    getText: () => editor.getText({ blockSeparator: '\n' }),
    setContent: (content: string) => editor.commands.setContent(prepareHTML(content), { emitUpdate: false }),
    focus: () => editor.commands.focus(),
    destroy: () => { editor.destroy(); options.element.replaceChildren(); options.toolbar?.replaceChildren() },
  }
}

function buildToolbar(host: HTMLElement, editor: Editor) {
  host.replaceChildren(); host.classList.add('dt-rich-toolbar'); host.setAttribute('aria-label','Formatação do texto')
  const buttons: { node: HTMLButtonElement; active?: () => boolean; enabled?: () => boolean }[] = []
  function button(label: string, icon: string, run: () => void, active?: () => boolean, enabled?: () => boolean) {
    const node = document.createElement('button'); node.type='button'; node.title=label; node.setAttribute('aria-label',label)
    const symbol = document.createElement('i'); symbol.className='fas '+icon; symbol.setAttribute('aria-hidden','true'); node.append(symbol)
    node.addEventListener('mousedown',event=>event.preventDefault())
    node.addEventListener('click',run); host.append(node); buttons.push({node,active,enabled})
  }
  function separator() { const line=document.createElement('span'); line.className='dt-tool-separator'; line.setAttribute('aria-hidden','true'); host.append(line) }
  const block = document.createElement('select'); block.setAttribute('aria-label','Estilo do parágrafo')
  for (const [value,label] of [['p','Texto'],['h2','Título'],['h3','Subtítulo']]) { const option=document.createElement('option'); option.value=value; option.textContent=label; block.append(option) }
  block.addEventListener('change',()=>{ const chain=editor.chain().focus(); if(block.value==='p')chain.setParagraph().run(); else chain.toggleHeading({level:block.value==='h2'?2:3}).run() }); host.append(block)
  separator()
  button('Negrito (Ctrl+B)','fa-bold',()=>editor.chain().focus().toggleBold().run(),()=>editor.isActive('bold'))
  button('Itálico (Ctrl+I)','fa-italic',()=>editor.chain().focus().toggleItalic().run(),()=>editor.isActive('italic'))
  button('Sublinhado (Ctrl+U)','fa-underline',()=>editor.chain().focus().toggleUnderline().run(),()=>editor.isActive('underline'))
  button('Destacar texto','fa-highlighter',()=>editor.chain().focus().toggleHighlight().run(),()=>editor.isActive('highlight'))
  separator()
  button('Lista com marcadores','fa-list-ul',()=>editor.chain().focus().toggleBulletList().run(),()=>editor.isActive('bulletList'))
  button('Lista numerada','fa-list-ol',()=>editor.chain().focus().toggleOrderedList().run(),()=>editor.isActive('orderedList'))
  button('Adicionar ou editar link','fa-link',()=>{
    const href=window.prompt('Endereço do link (https://…)',editor.getAttributes('link').href || 'https://')
    if(href===null)return
    if(!href.trim()){editor.chain().focus().unsetLink().run();return}
    if(!/^(https?:\/\/|mailto:)/i.test(href))return
    editor.chain().focus().extendMarkRange('link').setLink({href:href.trim()}).run()
  },()=>editor.isActive('link'))
  button('Remover formatação','fa-eraser',()=>editor.chain().focus().unsetAllMarks().clearNodes().run())
  separator()
  button('Desfazer (Ctrl+Z)','fa-rotate-left',()=>editor.chain().focus().undo().run(),undefined,()=>editor.can().undo())
  button('Refazer (Ctrl+Shift+Z)','fa-rotate-right',()=>editor.chain().focus().redo().run(),undefined,()=>editor.can().redo())
  function update() {
    for(const item of buttons){if(item.active)item.node.setAttribute('aria-pressed',String(item.active()));if(item.enabled)item.node.disabled=!item.enabled()}
    block.value=editor.isActive('heading',{level:2})?'h2':editor.isActive('heading',{level:3})?'h3':'p'
  }
  editor.on('transaction',update); update()
}

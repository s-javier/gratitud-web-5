export function autoResize(textareaRef: HTMLTextAreaElement) {
  textareaRef.style.height = 'auto'
  textareaRef.style.height = textareaRef.scrollHeight + 'px'
}

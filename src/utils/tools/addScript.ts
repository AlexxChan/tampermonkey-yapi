export function addScript(src: string) {
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.src = src
  document.documentElement.appendChild(script)
}


const autoGitHubTheme = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" media="screen and (prefers-color-scheme: light)" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" media="screen and (prefers-color-scheme: dark)" />`;

const autoBaseStyle = `<style>
@media screen and (prefers-color-scheme: light) {
  body {
    background-color: var(--d2h-bg-color);
  }
  h1,h2 {
    color: var(--d2h-light-color);
  }
}
@media screen and (prefers-color-scheme: dark) {
  body {
    background-color: rgb(13, 17, 23);
  }
  h1,h2 {
    color: var(--d2h-dark-color);
  }
}
</style>`;

export {
    autoGitHubTheme,
    autoBaseStyle,
}

## Description
The utility allows you to generate git diff html file with both `Unified/Split` styles

## Get started
* Run `npm install`
* Run `npm link -g`
* Use `diff2html-ms-cli --help` to get the help description

## Uninstallation
If you wish to uninstall the utility, just run `npm unlink diff2html-ms-cli -g`

## Example
`diff2html-ms-cli -F git.diff -D diff.html -T "Visual name" -V "1.0.11.0,f7be17e,Rejected;1.2.3.0,b3f9dd2,Approved;1.4.0.0,477fd03,Rejected;1.4.1.0,719a4ea,Current"`

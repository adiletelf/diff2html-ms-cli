import * as fs from "fs";
import {parse, html} from "diff2html";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import {
    lightGitHubTheme,
    darkGitHubTheme,
    autoGitHubTheme,
    lightBaseStyle,
    darkBaseStyle,
    autoBaseStyle,
} from "./styles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function replaceExactly(value, searchValue, replaceValue) {
    return value.replace(searchValue, () => replaceValue);
}

const diffString = fs.readFileSync("git.diff", "utf8");

const colorScheme = 'auto';
const lineByLineParsed = parse(diffString, { outputFormat: "line-by-line", colorScheme });
const lineByLineHTMLContent = html(lineByLineParsed, { outputFormat: "line-by-line", colorScheme });

const sideBySideParsed = parse(diffString, { outputFormat: "side-by-side", colorScheme });
const sideBySideHTMLContent = html(sideBySideParsed, { outputFormat: "side-by-side", colorScheme });

const template = fs.readFileSync("template.html", "utf8");
const cssContent = fs.readFileSync(path.resolve(__dirname, "node_modules/diff2html/bundles/css/diff2html.min.css"), "utf8");
const slimUIContent = fs.readFileSync(path.resolve(__dirname, "node_modules/diff2html/bundles/js/diff2html-ui-slim.min.js"), "utf8");


const previousVersions = [
    "1.0.11.0,f7be17e,Rejected",
    "1.2.3.0,b3f9dd2,Approved",
    "1.4.0.0,477fd03,Rejected",
    "1.4.1.0,719a4ea,Current",
];
const args = previousVersions.join(";");
const versions = args.split(';');

const versionsHTMLContent = versions.map((version) => `<span>${version.replaceAll(',', ' - ')}</span>`).join('<br/>');

const pageTitle = "Charticulator Visual Community (View) [Individual Entrepreneur Ilfat Galiev]";
const gitHubTheme = colorScheme === 'light' ? lightGitHubTheme : colorScheme === 'dark' ? darkGitHubTheme : autoGitHubTheme;
const baseStyle = colorScheme === 'light' ? lightBaseStyle : colorScheme === 'dark' ? darkBaseStyle : autoBaseStyle;

const result = [
    { searchValue: '<!--diff2html-title-->', replaceValue: pageTitle },
    { searchValue: '<!--diff2html-header-->', replaceValue: pageTitle },
    { searchValue: '<!--diff2html-versions-->', replaceValue: versionsHTMLContent },
    {
        searchValue: '<!--diff2html-css-->',
        replaceValue: `${baseStyle}\n${gitHubTheme}\n<style>\n${cssContent}\n</style>`,
    },
    { searchValue: '<!--diff2html-js-ui-->', replaceValue: `<script>\n${slimUIContent}\n</script>` },
    { searchValue: '<!--diff2html-line-diff-->', replaceValue: lineByLineHTMLContent },
    { searchValue: '<!--diff2html-side-diff-->', replaceValue: sideBySideHTMLContent },
].reduce(
    (previousValue, replacement) =>
        replaceExactly(previousValue, replacement.searchValue, replacement.replaceValue),
    template
);

fs.writeFileSync("diff.html", result);

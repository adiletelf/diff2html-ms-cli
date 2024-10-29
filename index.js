import { readFileSync, writeFileSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import {parse, html} from "diff2html";
import { autoGitHubTheme, autoBaseStyle } from "./styles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Read the arguments
const diffString = readDiffString();
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

const { lineByLineHTMLContent, sideBySideHTMLContent } = generateDiffHTMLContent(diffString);
const modifiedTemplate = replacePlaceholdersInTemplate(pageTitle, versionsHTMLContent, lineByLineHTMLContent, sideBySideHTMLContent);

writeFileSync("diff.html", modifiedTemplate);

function replaceExactly(value, searchValue, replaceValue) {
    return value.replace(searchValue, () => replaceValue);
}

function readDiffString() {
    return readFileSync("git.diff", "utf8");
}

function generateDiffHTMLContent(diffString, colorScheme = 'auto') {
    const lineByLineParsed = parse(diffString, { outputFormat: "line-by-line", colorScheme });
    const lineByLineHTMLContent = html(lineByLineParsed, { outputFormat: "line-by-line", colorScheme });

    const sideBySideParsed = parse(diffString, { outputFormat: "side-by-side", colorScheme });
    const sideBySideHTMLContent = html(sideBySideParsed, { outputFormat: "side-by-side", colorScheme });
    return { lineByLineHTMLContent, sideBySideHTMLContent };
}

function replacePlaceholdersInTemplate(pageTitle, versionsHTMLContent, lineByLineHTMLContent, sideBySideHTMLContent) {
    const template = readFileSync("template.html", "utf8");
    const cssContent = readFileSync(path.resolve(__dirname, "node_modules/diff2html/bundles/css/diff2html.min.css"), "utf8");
    const slimUIContent = readFileSync(path.resolve(__dirname, "node_modules/diff2html/bundles/js/diff2html-ui-slim.min.js"), "utf8");

    const modifiedTemplate = [
        { searchValue: '<!--diff2html-title-->', replaceValue: pageTitle },
        { searchValue: '<!--diff2html-header-->', replaceValue: pageTitle },
        { searchValue: '<!--diff2html-versions-->', replaceValue: versionsHTMLContent },
        {
            searchValue: '<!--diff2html-css-->',
            replaceValue: `${autoBaseStyle}\n${autoGitHubTheme}\n<style>\n${cssContent}\n</style>`,
        },
        { searchValue: '<!--diff2html-js-ui-->', replaceValue: `<script>\n${slimUIContent}\n</script>` },
        { searchValue: '<!--diff2html-line-diff-->', replaceValue: lineByLineHTMLContent },
        { searchValue: '<!--diff2html-side-diff-->', replaceValue: sideBySideHTMLContent },
    ].reduce(
        (previousValue, replacement) =>
            replaceExactly(previousValue, replacement.searchValue, replacement.replaceValue),
        template
    );

    return modifiedTemplate;
}

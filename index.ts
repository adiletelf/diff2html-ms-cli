import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {parse, html} from "diff2html";
import { autoGitHubTheme, autoBaseStyle } from "./styles.js";
import { ColorSchemeType } from "diff2html/lib/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirectory = path.resolve(__dirname, "..");

// 1. Read the arguments
const diffString: string = readDiffString(rootDirectory);
const previousVersions: string[] = [
    "1.0.11.0,f7be17e,Rejected",
    "1.2.3.0,b3f9dd2,Approved",
    "1.4.0.0,477fd03,Rejected",
    "1.4.1.0,719a4ea,Current",
];
const args = previousVersions.join(";");
const versions = args.split(';');
const versionsHTMLContent: string = versions.map((version) => `<span>${version.replaceAll(',', ' - ')}</span>`).join('<br/>');
const pageTitle: string = "Charticulator Visual Community (View) [Individual Entrepreneur Ilfat Galiev]";

const { lineByLineHTMLContent, sideBySideHTMLContent } = generateDiffHTMLContent(diffString);
const modifiedTemplate = replacePlaceholdersInTemplate({ pageTitle, versionsHTMLContent, lineByLineHTMLContent, sideBySideHTMLContent, dirname: rootDirectory });

writeFileSync(path.resolve(rootDirectory, "diff.html"), modifiedTemplate);

function replaceExactly(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, () => replaceValue);
}

function readDiffString(dirname: string): string {
    return readFileSync(path.resolve(dirname, "git.diff"), "utf8");
}

function generateDiffHTMLContent(diffString: string, colorScheme: ColorSchemeType = ColorSchemeType.AUTO): { lineByLineHTMLContent: string; sideBySideHTMLContent: string; } {
    const lineByLineParsed = parse(diffString, { outputFormat: "line-by-line", colorScheme });
    const lineByLineHTMLContent = html(lineByLineParsed, { outputFormat: "line-by-line", colorScheme });

    const sideBySideParsed = parse(diffString, { outputFormat: "side-by-side", colorScheme });
    const sideBySideHTMLContent = html(sideBySideParsed, { outputFormat: "side-by-side", colorScheme });
    return { lineByLineHTMLContent, sideBySideHTMLContent };
}

function replacePlaceholdersInTemplate({ dirname, pageTitle, versionsHTMLContent, lineByLineHTMLContent, sideBySideHTMLContent }: { dirname: string, pageTitle: string; versionsHTMLContent: string; lineByLineHTMLContent: string; sideBySideHTMLContent: string; }): string {
    const template = readFileSync(path.resolve(dirname, "template.html"), "utf8");
    const cssContent = readFileSync(path.resolve(dirname, "node_modules/diff2html/bundles/css/diff2html.min.css"), "utf8");
    const slimUIContent = readFileSync(path.resolve(dirname, "node_modules/diff2html/bundles/js/diff2html-ui-slim.min.js"), "utf8");

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

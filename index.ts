import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {parse, html} from "diff2html";
import { autoGitHubTheme, autoBaseStyle } from "./styles.js";
import { ColorSchemeType } from "diff2html/lib/types.js";
import { setup, defaults as defaultArgv } from "./yargs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirectory = path.resolve(__dirname, "..");

export async function main() {
    try {
        const argv = await setup();

        const diffString: string = readDiffString(argv.file || path.resolve(rootDirectory, defaultArgv.file));
        const { lineByLineHTMLContent, sideBySideHTMLContent } = generateDiffHTMLContent(diffString);

        const versions = argv.versionList.split(';');
        const versionsHTMLContent: string = versions.map((version) => `<span>${version.replaceAll(',', ' - ')}</span>`).join('<br/>');

        const modifiedTemplate = replacePlaceholdersInTemplate({
            pageTitle: argv.title,
            rootDirectory,
            versionsHTMLContent,
            lineByLineHTMLContent,
            sideBySideHTMLContent,
        });

        writeFileSync(argv.destination || path.resolve(rootDirectory, defaultArgv.destination), modifiedTemplate);

    } catch (error) {
        if (process.exitCode === undefined || process.exitCode === 0) {
            process.exitCode = 1;
        }

        console.error(error);
    }
}

main();


function replaceExactly(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, () => replaceValue);
}

function readDiffString(filePath: string): string {
    return readFileSync(filePath, "utf8");
}

function generateDiffHTMLContent(diffString: string, colorScheme: ColorSchemeType = ColorSchemeType.AUTO): { lineByLineHTMLContent: string; sideBySideHTMLContent: string; } {
    const lineByLineParsed = parse(diffString, { outputFormat: "line-by-line", colorScheme });
    const lineByLineHTMLContent = html(lineByLineParsed, { outputFormat: "line-by-line", colorScheme });

    const sideBySideParsed = parse(diffString, { outputFormat: "side-by-side", colorScheme });
    const sideBySideHTMLContent = html(sideBySideParsed, { outputFormat: "side-by-side", colorScheme });
    return { lineByLineHTMLContent, sideBySideHTMLContent };
}

function replacePlaceholdersInTemplate({ pageTitle, rootDirectory, versionsHTMLContent, lineByLineHTMLContent, sideBySideHTMLContent }: { pageTitle: string; rootDirectory: string; versionsHTMLContent: string; lineByLineHTMLContent: string; sideBySideHTMLContent: string; }): string {
    const template = readFileSync(path.resolve(rootDirectory, "template.html"), "utf8");
    const cssContent = readFileSync(path.resolve(rootDirectory, "node_modules/diff2html/bundles/css/diff2html.min.css"), "utf8");
    const slimUIContent = readFileSync(path.resolve(rootDirectory, "node_modules/diff2html/bundles/js/diff2html-ui-slim.min.js"), "utf8");

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

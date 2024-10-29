import { ColorSchemeType } from "diff2html/lib/types.js";
import yargs from "yargs";

export type Argv = {
    file: string;
    destination: string;
    title: string;
    versionList: string;
    colorScheme?: string;
};

export const defaults: Argv = {
    file: 'git.diff',
    destination: 'diff.html',
    title: 'Visual name',
    versionList: '',
    colorScheme: ColorSchemeType.AUTO,
};

export async function setup(): Promise<Argv> {
    const argv = await yargs(process.argv.slice(2))
        .usage("Usage: diff2html [options] -- [diff args]")
        .option('file', {
            alias: 'F',
            describe: 'Git diff file path',
            nargs: 1,
            type: 'string',
            default: defaults.file,
        })
        .option('destination', {
            alias: 'D',
            describe: 'Output file path',
            nargs: 1,
            type: 'string',
            default: defaults.destination,
        })
        .option('title', {
            alias: 'T',
            describe: 'HTML title',
            nargs: 1,
            type: 'string',
            default: defaults.title,
        })
        .option('versionList', {
            alias: 'V',
            description: "List of visual's versions in the format of 'versionNumber,hashCode,status'",
            type: 'string',
            default: defaults.versionList,
        })
        .option('colorScheme', {
            alias: 'C',
            description: 'Color scheme',
            nargs: 1,
            choices: [ColorSchemeType.AUTO, ColorSchemeType.LIGHT, ColorSchemeType.DARK],
            default: defaults.colorScheme,
        })
        .example(
            'diff2html -F git.diff -D diff.html -T "Charticulator" -V "1.0.11.0,f7be17e,Rejected;1.2.3.0,b3f9dd2,Approved;1.4.0.0,477fd03,Rejected;1.4.1.0,719a4ea,Current"',
            'Generate a diff.html file with the specified options'
        )
        .help()
        .alias('help', 'h')
        .alias('help', '?')

    return argv.argv;
}
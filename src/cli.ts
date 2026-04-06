import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { convertJsonToMermaid } from './index';

const program = new Command();

program
  .name('json2mermaid-ac-flow')
  .description('Convert Amazon Connect Flow JSON to Mermaid diagram')
  .version('1.0.0')
  .argument('<input-file>', 'input Amazon Connect Flow JSON file')
  .option('-o, --output <output-file>', 'output Mermaid file path')
  .action((inputFile: string, options: { output?: string }) => {
    try {
      if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file "${inputFile}" does not exist.`);
        process.exit(1);
      }

      const mermaidContent = convertJsonToMermaid(inputFile);

      let outputPath = options.output;
      if (!outputPath) {
        const parsedPath = path.parse(inputFile);
        outputPath = path.join(parsedPath.dir, `${parsedPath.name}.mmd`);
      }

      fs.writeFileSync(outputPath, mermaidContent, 'utf-8');
      console.log(`Successfully converted to: ${outputPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unknown error occurred.');
      }
      process.exit(1);
    }
  });

// 直接実行された場合のみパースを開始する
if (require.main === module) {
  program.parse(process.argv);
}

export { program };

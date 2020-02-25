import { getCurrentHash, getLastHash, reset, run, setLastHash } from './utils';

async function main() {
  const fullCommand = process.argv.slice(2).join(' ');

  if (fullCommand === 'reset') {
    await reset();
    process.exit(0);
  }

  const currentHash = await getCurrentHash();
  const lastHash = await getLastHash(fullCommand);

  if (!currentHash || currentHash !== lastHash) {
    console.log(`[fast-skip] Executing: ${fullCommand}`);
    const code = await run(process.argv[2], process.argv.slice(3));
    if (!code) {
      if (currentHash) {
        await setLastHash(fullCommand, currentHash);
        console.log(`[fast-skip] Saved hash for: ${fullCommand}`);
      }
    }
    process.exit(code);
  } else {
    console.log(`[fast-skip] Skipped command: ${fullCommand}`);
  }
}

main().then(null, error => console.error(error));

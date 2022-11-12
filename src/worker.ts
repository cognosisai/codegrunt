import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import { TEMPORAL_HOST } from '@cognosis/platform/dist/config';

async function run() {
    console.log( `Connecting to Temporal ${TEMPORAL_HOST}` );
    const connection = await NativeConnection.connect({
    address: TEMPORAL_HOST // defaults port to 7233 if not specified
    });

    const worker = await Worker.create({
    connection: connection,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'hello-world',
    debugMode: true
    });
  // Worker connects to localhost by default and uses console.error for logging.
  // Customize the Worker by passing more options to create():
  // https://typescript.temporal.io/api/classes/worker.Worker
  // If you need to configure server connection parameters, see docs:
  // https://docs.temporal.io/typescript/security#encryption-in-transit-with-mtls

  // Step 2: Start accepting tasks on the `hello-world` queue
    await worker.run();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

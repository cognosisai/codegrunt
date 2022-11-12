import { Connection, WorkflowClient } from '@temporalio/client';
import { extractFunctions_wf } from './workflows';
import { nanoid } from 'nanoid';
import fs from 'fs';
import { argv } from 'process';
import { TEMPORAL_HOST } from '@cognosis/platform/dist/config';

/**
 * Parse a file. Return a list of functions.
 * @param path Path to the file to be parsed
 */
async function run( path: string ): Promise< void > {
    const lines = (await fs.promises.readFile(path)).toString();

    const connection = await Connection.connect( {address: TEMPORAL_HOST} );
    const client = new WorkflowClient({
    connection
    });

    let handle = await client.start(extractFunctions_wf, {
        // type inference works! args: [name: string]
        args: [lines, path],
        taskQueue: 'hello-world',
        // in practice, use a meaningful business id, eg customerId or transactionId
        workflowId: nanoid(),
        workflowRunTimeout: '10 minutes',
    });

    console.log( (await handle.result()).join("\n\n")  );
}

run(process.argv[2]).catch((err) => {
    console.error(err);
    process.exit(1);
});

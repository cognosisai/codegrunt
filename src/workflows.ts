export * from '@cognosis/platform/dist/workflows';
import {workflows} from '@cognosis/platform';
import { proxyActivities, uuid4 } from '@temporalio/workflow';
import * as activities from './activities';

const {extractFunctions} = proxyActivities<typeof activities>({startToCloseTimeout: '10 minute' });
// Permanent errors are errors that are not expected to be resolved by retrying the workflow.
// For example, a permanent error could be thrown if the workflow is unable to connect to the
// Temporal server or if the workflow is unable to parse the code.

export async function extractFunctions_wf( code: string, filename: string ): Promise< Array< string > > {
    let functions = await extractFunctions( code, filename );
//    return functions.map( (f) => `/*${f.leadingComment}*/\n${f.code}` );

    return functions.map( (f) => JSON.stringify(f) );
}

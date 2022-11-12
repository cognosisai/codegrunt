import * as wf from '@temporalio/workflow';
export * from '@cognosis/platform/dist/workflows';
import {workflows} from '@cognosis/platform';
import { proxyActivities, uuid4 } from '@temporalio/workflow';
import * as activities from './activities';
import * as session_wfs from '@cognosis/platform/dist/workflows/session';

const {extractFunctions} = proxyActivities<typeof activities>({startToCloseTimeout: '10 minute' });
// Permanent errors are errors that are not expected to be resolved by retrying the workflow.
// For example, a permanent error could be thrown if the workflow is unable to connect to the
// Temporal server or if the workflow is unable to parse the code.

export async function extractFunctions_wf( code: string, filename: string ): Promise< Array< any > > {
    let functions = await extractFunctions( code, filename );
    return functions;
}


export async function testSession( first_message: session_wfs.Frame )
{
    let session = new session_wfs.HumanInTheLoopSession< session_wfs.Frame >();
    session.init();

    // Start the session
    session.addMessage( {... first_message} );
    session.log( "Session started" );

    while( true )
    {
        let timeout_promise = wf.sleep("10 seconds");
        let input_promise = session.getInput( session );
        let p = await Promise.race( [timeout_promise, input_promise] );
        if ( p == await timeout_promise )
        {
            session.log( "Session timed out" );
            break;
        }
        let input = await input_promise;

        session.addMessage({text: input, ts: new Date(), logs: []});
        session.log( "User input: " + input );
        let response = await workflows.promptTemplate(
`User: {{{input}}}
Response:`, { input: input }, 10, 512 );
        session.log( "Response: " + response );
        session.send( response );
    }
}

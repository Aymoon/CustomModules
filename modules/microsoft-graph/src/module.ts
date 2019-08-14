import { Client } from "@microsoft/microsoft-graph-client";

/**
 * Sign in to Microsoft Graph.
 * @arg {SecretSelect} `secret` The configured secret to use
 * @arg {CognigyScript} `redirectUri` The url to redirect after signing in
 * @arg {CognigyScript} `userMail` `Only necessary if you want to get infos of a specific person! The person's email address.`
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function signInToGraph(input: IFlowInput, args: { secret: CognigySecret, redirectUri: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check secret
    const { secret, redirectUri, contextStore, stopOnError } = args;
    if (!secret) return Promise.reject("No secret defined.");

    // check secrets
    const { clientId, clientSecret } = secret;
    if (!clientId) return Promise.reject("Secret is missing the 'clientId' field.");
    if (!clientSecret) return Promise.reject("Secret is missing the 'clientSecret' field.");

    try {
        const callback = (errorDesc, token, error, tokenType) => { };
        // An Optional options for initializing the MSAL @see https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics#configuration-options
        const options = {
            redirectUri,
        };
        const graphScopes = ["user.read", "mail.send"]; // An array of graph scopes

        // Initialize the MSAL @see https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics#initialization-of-msal
        // const userAgentApplication = new Msal.UserAgentApplication(clientId, undefined, callback, options);
        // const authProvider = new MicrosoftGraph.MSALAuthenticationProvider(userAgentApplication, graphScopes);

        input.actions.addToContext(contextStore, null, 'simple');
    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.signInToGraph = signInToGraph;

/**
 * Get the user details.
 * @arg {CognigyScript} `accessToken` The text to analyse
 * @arg {Select[me,all,specific person]} `userSource` The user information source
 * @arg {CognigyScript} `userMail` `Only necessary if you want to get infos of a specific person! The person's email address.`
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function getUserDetails(input: IFlowInput, args: { accessToken: string, userSource: string, userMail?: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check parameters
    const { accessToken, userSource, userMail, contextStore, stopOnError } = args;
    if (!accessToken) return Promise.reject("No access token defined. Please use the Azure Custom Module for authenticating the user.");
    if (!userSource) return Promise.reject("No user source defined. If you want to get your own information, use 'me', otherwise get the information of all users by selecting 'all'.");
    if (userSource === "specific person" && !userMail) return Promise.reject("You have to define the user's mail who you want to search for.");
    if (!contextStore) return Promise.reject("No context store key defined.");
    if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

    try {
        const client: Client = getAuthenticatedClient(accessToken);
        let path: string = "";

        if (userSource === "me") path = "/me";
        else if (userSource === "all") path = "/users";
        else if (userSource === "specific person") path = `/users/${userMail}`;

        const user = await client.api(path).get();

        input.actions.addToContext(contextStore, user, 'simple');
    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.getUserDetails = getUserDetails;

/**
 * Gets events from calendars.
 * @arg {CognigyScript} `accessToken` The text to analyse
 * @arg {Select[me,all,specific person]} `userSource` The user information source
 * @arg {CognigyScript} `userMail` `Only necessary if you want to get infos of a specific person! The person's email address.`
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function getEventsFromCalendar(input: IFlowInput, args: { accessToken: string, userSource: string, userMail?: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check parameters
    const { accessToken, userSource, userMail, contextStore, stopOnError } = args;
    if (!accessToken) return Promise.reject("No access token defined. Please use the Azure Custom Module for authenticating the user.");
    if (!userSource) return Promise.reject("No user source defined. If you want to get your own information, use 'me', otherwise get the information of all users by selecting 'all'.");
    if (userSource === "specific person" && !userMail) return Promise.reject("You have to define the user's mail who you want to search for.");
    if (!contextStore) return Promise.reject("No context store key defined.");
    if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

    try {
        const client: Client = getAuthenticatedClient(accessToken);
        let path: string = "";

        if (userSource === "me") path = "/me/events";
        else if (userSource === "all") path = "/me/calendar/events";
        else if (userSource === "specific person") path = `/users/${userMail}/calendar/events`;

        const user = await client.api(path).get();

        input.actions.addToContext(contextStore, user, 'simple');
    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.getEventsFromCalendar = getEventsFromCalendar;

/**
 * Send a mail with the logged in user.
 * @arg {CognigyScript} `accessToken` The text to analyse
 * @arg {CognigyScriptArray} `recipients` The recipients of the sent mail
 * @arg {CognigyScript} `subject` The mail's subject
 * @arg {CognigyScript} `content` The mail's content
 * @arg {Select[html,text]} `contentType` The type of the mail's text
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function sendMail(input: IFlowInput, args: { accessToken: string, recipients: string[], subject: string, content: string, contentType: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check parameters
    const { accessToken, recipients, subject, content, contentType, contextStore, stopOnError } = args;
    if (!accessToken) return Promise.reject("No access token defined. Please use the Azure Custom Module for authenticating the user.");
    if (!recipients) return Promise.reject("No email recipients defined.");
    if (!subject) return Promise.reject("No email subject defined.");
    if (!content) return Promise.reject("No email content defined.");
    if (!contentType) return Promise.reject("No email content type defined.");
    if (!contextStore) return Promise.reject("No  defined.");
    if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

    try {
        const client = getAuthenticatedClient(accessToken);

        // Construct email object
        const mail = {
            subject,
            toRecipients: createRecipientsList(recipients),
            body: {
                content,
                contentType,
            },
        };
        try {
            const response = await client.api("/me/sendMail").post({ message: mail });

            input.actions.addToContext(contextStore, response, 'simple');
        } catch (error) {
            if (stopOnError) {
                throw new Error(error.message);
            } else {
                input.actions.addToContext(contextStore, { error: error.message }, 'simple');
            }
        }

    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.sendMail = sendMail;

/**
 * Schedule a new meeting.
 * @arg {CognigyScript} `accessToken` The text to analyse
 * @arg {Select[UTC,PST]} `timeZone` The meeting's time zone
 * @arg {CognigyScript} `subject` The meeting's subject
 * @arg {CognigyScript} `content` The meeting's content
 * @arg {Select[html,text]} `contentType` The content's type
 * @arg {CognigyScript} `startTime` The meeting's start time
 * @arg {CognigyScript} `endTime` The meeting's end time
 * @arg {CognigyScriptArray} `attendees` The mails of all attendees. Not required!
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function scheduleMeeting(input: IFlowInput, args: { accessToken: string, timeZone: string, subject: string, content: string, contentType: string, startTime: string, endTime: string, attendees?: string[], contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check parameters
    const { accessToken, timeZone, subject, content, contentType, startTime, endTime, attendees, contextStore, stopOnError } = args;
    if (!accessToken) return Promise.reject("No access token defined. Please use the Azure Custom Module for authenticating the user.");
    if (!timeZone) return Promise.reject("No time zone defined.");
    if (!startTime) return Promise.reject("No start time defined.");
    if (!endTime) return Promise.reject("No end time defined.");
    if (!subject) return Promise.reject("No meeting subject defined.");
    if (!content) return Promise.reject("No content defined.");
    if (!contentType) return Promise.reject("No content type defined.");
    if (!contextStore) return Promise.reject("No  defined.");
    if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

    try {
        const client = getAuthenticatedClient(accessToken);


        const meeting = {
            subject,
            body: {
                contentType,
                content
            },
            start: {
                dateTime: startTime,
                timeZone
            },
            end: {
                dateTime: endTime,
                timeZone
            },
            attendees: createAttendeesList(attendees)
        };


        try {
            const response = await client.api("/me/events").post(meeting);

            input.actions.addToContext(contextStore, response, 'simple');
        } catch (error) {
            if (stopOnError) {
                throw new Error(error.message);
            } else {
                input.actions.addToContext(contextStore, { error: error.message }, 'simple');
            }
        }

    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.scheduleMeeting = scheduleMeeting;

/**
 * Get all your contacts.
 * @arg {CognigyScript} `accessToken` The text to analyse
 * @arg {CognigyScript} `contextStore` Where to store the result
 * @arg {Boolean} `stopOnError` Whether to stop on error or continue
 */
async function getContacts(input: IFlowInput, args: { accessToken: string, contextStore: string, stopOnError: boolean }): Promise<IFlowInput | {}> {
    // Check parameters
    const { accessToken, contextStore, stopOnError } = args;
    if (!accessToken) return Promise.reject("No access token defined. Please use the Azure Custom Module for authenticating the user.");
    if (!contextStore) return Promise.reject("No context store key defined.");
    if (stopOnError === undefined) throw new Error("Stop on error flag not defined.");

    try {
        const client: Client = getAuthenticatedClient(accessToken);

        const user = await client.api('me/contacts').get();

        input.actions.addToContext(contextStore, user, 'simple');
    } catch (error) {
        if (stopOnError) {
            throw new Error(error.message);
        } else {
            input.actions.addToContext(contextStore, { error: error.message }, 'simple');
        }
    }

    return input;
}

module.exports.getContacts = getContacts;


function getAuthenticatedClient(accessToken: string): Client {
    // Initialize Graph client
    const client = Client.init({
        // Use the provided access token to authenticate requests
        authProvider: (done: any) => {
            done(null, accessToken);
        }
    });

    return client;
}

function createRecipientsList(recipients: string[]): object[] {

    const list: object[] = [];

    for (const r of recipients) {
        list.push({
            emailAddress: {
                address: r,
             },
        });
    }

    return list;
}

function createAttendeesList(attendees: string[]): object[] {

    const list: object[] = [];

    for (const a of attendees) {
        list.push({
            emailAddress: {
              address: a,
              name: "Guest"
            },
            type: "Required"
          });
        }

    return list;
}
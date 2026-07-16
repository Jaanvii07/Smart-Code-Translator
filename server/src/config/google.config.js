import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (credential) => {
    try{
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        };
    }
    catch (error) {
        const err = new Error("Invalid Google token.");
        err.statusCode = 401;
        throw err;
    }
};

export { googleClient, verifyGoogleToken };
import { authClient } from "@/lib/auth-client";

const { data, error } = await authClient.signIn.email({
    /**
     * The user email
     */
    email,
    /**
     * The user password
     */
    password,
    /**
     * a url to redirect to after the user verifies their email (optional)
     */
    callbackURL: "/dashboard",
    /**
     * remember the user session after the browser is closed. 
     * @default true
     */
    rememberMe: false
}, {
//callbacks
})
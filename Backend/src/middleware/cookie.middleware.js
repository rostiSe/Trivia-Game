export const setCookieMiddleware = (req, res, next) => {
    // Attach a setCookieWithOptions method to res object
    res.setCookieWithOptions = (token) => {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        };

        console.log('Setting cookie with options:', cookieOptions);
        console.log('Token:', token);

        // Set standard token cookie
        res.cookie('token', token, cookieOptions);

        // For platforms like Firebase/Render that might need __session
        res.cookie('__session', token, cookieOptions);

        // Log the headers to help with debugging
        console.log('Response headers after setting cookie:', res.getHeaders());
    };

    next();
};


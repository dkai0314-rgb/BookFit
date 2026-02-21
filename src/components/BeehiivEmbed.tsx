"use client";

import { useEffect, useRef } from "react";

export default function BeehiivEmbed() {
    // This is a placeholder for the Beehiiv embed code.
    // User needs to replace this with their actual embed code from Beehiiv.

    // Example structure provided by Beehiiv usually looks like:
    // <iframe ...></iframe>
    // <script ...></script>

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://subscribe-forms.beehiiv.com/embed.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="w-full max-w-[320px] sm:max-w-md mx-auto flex justify-center px-2 sm:px-0">
            <iframe
                src="https://subscribe-forms.beehiiv.com/fa2ef120-ce5b-4bce-9201-5f5b40f4d753"
                data-test-id="beehiiv-embed"
                frameBorder="0"
                scrolling="no"
                className="w-full h-[300px] sm:h-[350px]"
                style={{
                    margin: 0,
                    borderRadius: "0px",
                    backgroundColor: "transparent",
                }}
            />
        </div>
    );
}

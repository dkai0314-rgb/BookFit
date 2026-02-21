"use client";

import { useEffect } from "react";

export default function BeehiivEmbed() {
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
        <div className="w-full flex justify-center">
            <iframe
                src="https://subscribe-forms.beehiiv.com/fa2ef120-ce5b-4bce-9201-5f5b40f4d753"
                className="beehiiv-embed"
                data-test-id="beehiiv-embed"
                frameBorder="0"
                scrolling="no"
                style={{
                    width: "397px",
                    height: "230px",
                    margin: 0,
                    borderRadius: "0px",
                    backgroundColor: "transparent",
                    boxShadow: "0 0 #0000",
                    maxWidth: "100%",
                }}
            />
        </div>
    );
}

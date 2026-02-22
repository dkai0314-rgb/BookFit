"use client";
import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        fetch('/api/books?choice=true')
            .then(async res => {
                const json = await res.json();
                setData({
                    status: res.status,
                    ok: res.ok,
                    body: json
                });
            })
            .catch(err => setError(err.toString()));
    }, []);

    return (
        <div className="p-8 bg-black text-green-400 min-h-screen font-mono text-base overflow-auto">
            <h1 className="text-2xl font-bold mb-4 text-white">?š§ BookFit Debugger ?š§</h1>

            <div className="mb-8 border border-white/20 p-4 rounded bg-white/5">
                <h2 className="text-xl text-white mb-2">Client Error</h2>
                <pre>{error || "No Fetch Error"}</pre>
            </div>

            <div className="mb-8 border border-white/20 p-4 rounded bg-white/5">
                <h2 className="text-xl text-white mb-2">API Response (Status: {data?.status})</h2>
                <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(data?.body, null, 2)}
                </pre>
            </div>
        </div>
    );
}

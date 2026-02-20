
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { searchBookInAladin } from './aladin';

// Environment variables
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newlines
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export interface SheetCuration {
    id: string; // Use Sheet ID or generated ID
    theme: string;
    title: string;
    description: string;
    books: SheetBook[];
}

export interface SheetBook {
    id: string; // Generate from index or title
    title: string;
    author: string;
    category: string;
    recommendation: string;
    coupangLink: string;
    // Enriched fields from Aladin
    imageUrl?: string;
    viewerUrl?: string;
}

export async function fetchCurationFromSheet(): Promise<SheetCuration | null> {
    if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
        console.error("Missing Google Sheets credentials:");
        console.error("- EMAIL:", SERVICE_ACCOUNT_EMAIL ? "Set" : "Missing");
        console.error("- KEY:", PRIVATE_KEY ? "Set" : "Missing");
        console.error("- SHEET_ID:", SHEET_ID ? "Set" : "Missing");
        return null;
    }

    try {
        const jwt = new JWT({
            email: SERVICE_ACCOUNT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // Assume first sheet

        // 1. Fetch Metadata (Rows 1-3)
        // Load cells for metadata B1:B3 (Row index 0-2, Col index 1)
        await sheet.loadCells('A1:B3');
        const theme = sheet.getCell(0, 1).value?.toString() || ""; // B1
        const title = sheet.getCell(1, 1).value?.toString() || ""; // B2
        const description = sheet.getCell(2, 1).value?.toString() || ""; // B3

        // 2. Fetch Books (Row 6+)
        // Load a range from Row 6 to 200 (Indices 5 to 199)
        // Columns A, B, C, D, E (Indices 0, 1, 2, 3, 4)
        // A: Category (e.g. "소설", "마케팅") - Used for grouping if needed
        // B: Title
        // C: Author
        // D: One-line Summary
        // E: Coupang Link
        await sheet.loadCells('A6:E200');

        const books: SheetBook[] = [];

        let lastCategory = "";

        // Iterate rows 6 to 200 (indices 5 to 199)
        for (let r = 5; r <= 199; r++) {
            let category = sheet.getCell(r, 0).value?.toString() || ""; // Col A
            if (category) {
                lastCategory = category;
            } else {
                category = lastCategory; // Fill down logic
            }
            const rowTitle = sheet.getCell(r, 1).value?.toString(); // Col B

            if (!rowTitle) continue; // Stop if title is empty

            const rowAuthor = sheet.getCell(r, 2).value?.toString() || ""; // Col C
            const rowRec = sheet.getCell(r, 3).value?.toString() || ""; // Col D
            const rowLink = sheet.getCell(r, 4).value?.toString() || ""; // Col E

            // Enrich with Aladin (Search using Title from Col B)
            const aladinData = await searchBookInAladin(rowTitle);

            books.push({
                id: `sheet-${r}`,
                title: aladinData?.title || rowTitle,
                author: aladinData?.author || rowAuthor,
                category: category,
                recommendation: rowRec,
                coupangLink: rowLink,
                imageUrl: aladinData?.cover || undefined,
                viewerUrl: aladinData?.viewerUrl || undefined
            });
        }

        if (books.length === 0) {
            console.warn("No valid books extracted from sheet.");
            return null;
        }

        return {
            id: SHEET_ID,
            theme,
            title,
            description,
            books
        };

    } catch (error: any) {
        console.error("Google Sheets Fetch Error:", error);
        if (error.response) {
            console.error("Error Response Body:", JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

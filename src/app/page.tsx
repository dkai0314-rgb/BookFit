import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, MessageSquare, BookCheck, Lightbulb } from "lucide-react";
import CurationSection from "@/components/CurationSection";
import BeehiivEmbed from "@/components/BeehiivEmbed";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-[#061A14]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]" role="banner">
        <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2 font-serif tracking-tight cursor-pointer" aria-label="BookFit ??>
            <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm">BookFit</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-base font-medium text-gray-400" aria-label="ë©”ì¸ ?¤ë¹„ê²Œì´??>
            <Link href="/curation" className="hover:text-accent transition-colors">?´ë‹¬?˜ë¶??/Link>
            <Link href="/bestsellers" className="hover:text-accent transition-colors">ë² ìŠ¤?¸ì???/Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5" aria-label="ë¡œê·¸??>Login</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center" id="main-content">
        {/* Hero Section */}
        <section className="relative w-full py-32 md:py-48 text-center flex flex-col items-center space-y-8 overflow-hidden" aria-labelledby="hero-title">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/library_background.png')" }}
            />
            {/* Adjusted overlay for better visibility of background based on feedback */}
            <div className="absolute inset-0 bg-[#061A14]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061A14] via-transparent to-[#061A14]/60" />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-6 px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/20 backdrop-blur-sm px-3 py-1 text-base font-semibold text-primary-foreground transition-colors">
              <Sparkles className="w-3 h-3 mr-1 text-accent" />
              ê·¼ê±° ?ˆëŠ” ë§ì¶¤ ?„ì„œ ì¶”ì²œ
            </div>
            <h1 id="hero-title" className="text-4xl md:text-7xl font-extrabold tracking-tight text-white break-keep drop-shadow-sm leading-tight">
              ì§€ê¸??¹ì‹ ?ê²Œ ?„ìš”??<br className="md:hidden" />
              <span className="text-accent italic">
                ????ê¶?
              </span>
            </h1>
            <p className="max-w-[700px] text-gray-300 md:text-xl break-keep leading-relaxed drop-shadow-sm font-light">
              AI ë¶„ì„?¼ë¡œ ì§€ê¸ˆì˜ ?¹ì‹ ?ê²Œ ?„ìš”??ì±…ì„ ì°¾ìŠµ?ˆë‹¤.<br />
              ?½ì–´?????´ìœ ë¥?ë¨¼ì? ?•ì¸?˜ê³ , ?•ì‹  ?ˆê²Œ ? íƒ?˜ì„¸??
            </p>
            <div className="flex gap-4 pt-6">
              <Link href="/recommend">
                <Button size="lg" className="rounded-md bg-accent text-[#061A14] hover:bg-white hover:text-accent font-bold px-8 py-6 text-lg shadow-lg shadow-black/20 transition-all hover:scale-105 border border-transparent" aria-label="AI ë§ì¶¤ ?„ì„œ ì¶”ì²œ ?œì‘?˜ê¸°">
                  <Sparkles className="mr-2 h-5 w-5" />
                  AI ë§ì¶¤ ì¶”ì²œ
                </Button>
              </Link>
              <Link href="/bestsellers">
                <Button variant="outline" size="lg" className="rounded-md border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm transition-all hover:border-white/40" aria-label="ë² ìŠ¤?¸ì????•ì¸?˜ê¸°">
                  ë² ìŠ¤?¸ì???
                </Button>
              </Link>
            </div>
          </div>
        </section>


        {/* BookFit Choice (Google Sheets Integration) */}
        <CurationSection id="curation" />

        {/* Your BookFit Journey (Previously The BookFit Approach) - Updated */}
        <section className="w-full py-24 px-6 relative" aria-labelledby="journey-title">
          <div className="max-w-6xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <h2 id="journey-title" className="text-3xl md:text-4xl font-bold text-white font-serif">Your BookFit Journey</h2>
              <div className="w-12 h-0.5 bg-accent/30 mx-auto" aria-hidden="true"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              <article className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-transparent group-hover:bg-white/5 transition-colors" aria-hidden="true">
                  <MessageSquare className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white">?í™© ë¶„ì„</h3>
                <p className="text-base text-gray-400 leading-relaxed max-w-xs mx-auto break-keep">
                  ?¹ì‹ ??ëª©í‘œ, ê³ ë?, ê´€?¬ì‚¬ë¥?ì§§ì? ì§ˆë¬¸?¼ë¡œ ?•ë¦¬???µì‹¬ ?¤ì›Œ?œë? ë½‘ì•„?…ë‹ˆ??
                </p>
              </article>
              <article className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-transparent group-hover:bg-white/5 transition-colors" aria-hidden="true">
                  <BookCheck className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white">??ë§ëŠ” ì¶”ì²œ</h3>
                <p className="text-base text-gray-400 leading-relaxed max-w-xs mx-auto break-keep">
                  ë¶„ì„???¤ì›Œ?œë¡œ ì§€ê¸??¹ì‹ ?ê²Œ ê°€???„ìš”??ì±???ê¶Œì„ ?•ë??˜ê²Œ ì¶”ì²œ?©ë‹ˆ??
                </p>
              </article>
              <article className="flex flex-col items-center text-center space-y-4 group">
                <div className="mb-2 p-4 rounded-full bg-transparent group-hover:bg-white/5 transition-colors" aria-hidden="true">
                  <Lightbulb className="w-8 h-8 text-accent/80 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white">ì¶”ì²œ ê·¼ê±°</h3>
                <p className="text-base text-gray-400 leading-relaxed max-w-xs mx-auto break-keep">
                  ?˜ì™œ ??ì±…ì¸ì§€?™ë? ?œëˆˆ???´í•´?˜ë„ë¡? ì¶”ì²œ ?´ìœ ?€ ?ìš© ?¬ì¸?¸ë? ?¨ê»˜ ?œê³µ?©ë‹ˆ??
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Email Subscription Section - Beehiiv Integration */}
        <section className="w-full py-24 px-6 relative mt-10" aria-labelledby="subscription-title">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0B2A1F] to-[#04120e] rounded-2xl p-6 sm:p-10 md:p-16 text-center border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent/5 blur-3xl pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 id="subscription-title" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-serif leading-tight">
                  ?¹ì‹ ë§Œì˜ ?œì¬ë¥?<br />?„ì„±??ì¤€ë¹„ê? ?˜ì…¨?˜ìš”?
                </h2>
                <p className="text-gray-400 font-light">
                  ë§¤ì£¼ ?˜ìš”?? ë¶í•??? ì •???ê°??ë¬¸ì¥??ë©”ì¼?¨ìœ¼ë¡?ë³´ë‚´?œë¦½?ˆë‹¤.
                </p>
              </div>

              {/* Beehiiv Embed Component */}
              <div className="pt-4">
                <BeehiivEmbed />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-base text-gray-600 border-t border-[rgba(255,255,255,0.05)] bg-[#04120e]" role="contentinfo">
        <p>Â© 2026 BookFit. All rights reserved.</p>
      </footer>
    </div>
  );
}

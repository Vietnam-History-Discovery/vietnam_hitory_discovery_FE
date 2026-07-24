import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/home/HeroSection'
import FeaturedDynasties from '../components/home/FeaturedDynasties'
import TimelineSection from '../components/home/TimelineSection'
import ArticlesPreviewSection from '../components/home/ArticlesPreviewSection'
import ChatCTASection from '../components/home/ChatCTASection'

function Footer() {
  return (
    <footer className="border-t border-surface2 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Vietnam Chronicles
        </span>
        <p className="text-xs text-gray-600 text-center">
          An AI-powered exploration of Vietnamese history
        </p>
        <p className="text-xs text-gray-700">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedDynasties />
        <TimelineSection />
        <ArticlesPreviewSection />
        <ChatCTASection />
      </main>
      <Footer />
    </div>
  )
}

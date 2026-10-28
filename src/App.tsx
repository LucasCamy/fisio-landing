import { useEffect } from 'react'
import { Footer } from './components/Footer'
import { FloatingBottomDock } from './components/nav/FloatingBottomDock'
import { Navbar } from './components/nav/Navbar'
import { AboutSpecialistSection } from './components/sections/AboutSpecialistSection'
import { AnatomyAssemblySection } from './components/sections/AnatomyAssemblySection'
import { ContactDarkSection } from './components/sections/ContactDarkSection'
import { FAQSection } from './components/sections/FAQSection'
import { Hero } from './components/sections/Hero'
import { ProcessStickySection } from './components/sections/ProcessStickySection'
import { SignatureTreatmentSection } from './components/sections/SignatureTreatmentSection'
import { SymptomsFanSection } from './components/sections/SymptomsFanSection'
import { ScrollTrigger } from './lib/scroll'

export default function App() {
  // Imagens lazy e fontes mudam a altura do documento: recalcula os pins quando terminam
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <a
        href="#conteudo"
        className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo" className="overflow-x-clip">
        <Hero />
        <SymptomsFanSection />
        <AnatomyAssemblySection />
        <SignatureTreatmentSection />
        <ProcessStickySection />
        <AboutSpecialistSection />
        <FAQSection />
        <ContactDarkSection />
      </main>
      <Footer />
      <FloatingBottomDock />
    </>
  )
}

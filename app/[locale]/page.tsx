import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import Departments from '@/components/sections/Departments'
import Rewards from '@/components/sections/Rewards'
import CTA from '@/components/sections/CTA'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Departments />
        <Rewards />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
